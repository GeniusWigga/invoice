const _ = require("lodash");
const http = require("http");
const path = require("path");
const pdfService = require("./services/invoice/pdf.js");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const hostname = "127.0.0.1";
const port = 3000;

const VAC = 0.19;

if (process.env.NODE_ENV !== "production") {
  if (
    !require("piping")({
      hook: true,
      ignore: /(\/\.|~$|\.json$)/i
    })
  ) {
    return;
  }
}

const invoiceHtmlPath = path.join(
  __dirname,
  "services",
  "invoice",
  "invoice.html"
);
const invoiceStylePath = path.join(
  __dirname,
  "services",
  "invoice",
  "css",
  "style.css"
);

const dbPath = path.join(__dirname, "db", "db.json");
const PDF_PATH = "pdf";
const EMAIL_PATH = "email";

const getTotalPrice = (price, count) => {
  return price * count;
};

const getVac = subTotal => {
  return subTotal * VAC;
};

const getHtmlContent = async () => {
  const db = low(new FileSync(dbPath));
  const users = db
    .get("users")
    .find({ id: 1 })
    .value();

  const clients = db
    .get("clients")
    .find({ id: "KD000002" })
    .value();

  const account = db
    .get("users")
    .find({ id: 1 })
    .get("account")
    .find({ id: 1 })
    .value();

  const invoice = {
    count: 10,
    price: 140
  };

  invoice.subTotal = getTotalPrice(invoice.price, invoice.count);
  invoice.vac = getVac(invoice.subTotal);
  invoice.total = invoice.subTotal + invoice.vac;

  const htmlContent = await pdfService.html(invoiceHtmlPath, {
    clients: clients,
    users: users,
    account: account,
    invoice: invoice
  });

  return htmlContent;
};

const server = http.createServer(async (req, res) => {
  const url = req.url;

  const path = _.get(_.split(url, "/"), 1);

  try {
    const htmlContent = await getHtmlContent();

    if (path === PDF_PATH) {
      const pdfContent = await pdfService.pdf(htmlContent);
      res.setHeader("Content-Type", "application/pdf");
      return res.end(pdfContent);
    }

    res.setHeader("Content-Type", "text/html");
    res.statusCode = 200;
    res.end(htmlContent);
  } catch (error) {
    console.log("error: ", error);
    res.setHeader("Content-Type", "text/plain");
    res.statusCode = 400;
    res.end(error);
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
