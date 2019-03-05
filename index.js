const _ = require("lodash");
const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const accounting = require("accounting");

dayjs.extend(customParseFormat);

const port = 3000;

const VAC = 0.19;

const DATE_FORMAT = "DD.MM.YYYY";
const DAY_MIDDLE = "15";

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

const dbPath = path.join(__dirname, "db", "db.json");

const getTotalPrice = (price, count) => {
  return price * count;
};

const getVac = subTotal => {
  return subTotal * VAC;
};

const getDates = () => {
  const dateStart = dayjs()
    .startOf("month")
    .format(DATE_FORMAT);
  const dateEnd = dayjs()
    .endOf("month")
    .format(DATE_FORMAT);
  const dateCurrent = dayjs()
    .format(DATE_FORMAT);
  const currentMonth = dayjs()
    .format("MM");
  const currentYear = dayjs()
    .format("YYYY");
  const dateMiddle = [DAY_MIDDLE, currentMonth, currentYear].join(".");
  const isBefore = dayjs(dateCurrent, DATE_FORMAT)
    .isBefore(
      dayjs(dateMiddle, DATE_FORMAT)
    );

  const startDateFromEnv = process.env.DATE_START;
  const endDateFromEnv = process.env.DATE_END;

  return {
    start: !_.isNil(startDateFromEnv) ? startDateFromEnv : isBefore ? dateStart : dateMiddle,
    end: !_.isNil(endDateFromEnv) ? endDateFromEnv : isBefore ? dateMiddle : dateEnd,
    current: dateCurrent,
    middle: dateMiddle
  };
};

const getFormattedMoney = v =>
  accounting.formatMoney(v, {
    symbol: "€",
    format: "%v %s",
    decimal: ",",
    thousand: ".",
    precision: 2
  });

const app = express();
const hbs = exphbs.create({ /* config */ });

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set('views', path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res) {

  const db = low(new FileSync(dbPath));
  const clientId = process.env.CLIENT_ID || "KD000002";

  const users = db
    .get("users")
    .find({ id: 1 })
    .value();

  const clients = db
    .get("clients")
    .find({ id: clientId })
    .value();

  const account = db
    .get("users")
    .find({ id: 1 })
    .get("account")
    .find({ id: 1 })
    .value();

  const dates = getDates();

  const price = 140;
  const count = 12;
  const invoiceId = "RE000000";

  const invoice = {
    id: invoiceId,
    count: count,
    price: getFormattedMoney(price)
  };

  const subTotal = getTotalPrice(price, invoice.count);
  const vac = getVac(subTotal);
  const total = subTotal + vac;

  invoice.subTotal = getFormattedMoney(subTotal);
  invoice.vac = getFormattedMoney(vac);
  invoice.total = getFormattedMoney(total);
  invoice.title = invoiceId;

  const data = {
    clients: clients,
    users: users,
    account: account,
    invoice: invoice,
    date: dates
  };

  res.render("invoice", data);
});

app.listen(port, function() {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
