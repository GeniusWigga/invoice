const $pdfButton = $(".button.pdf");
const $invoiceId = $(".input-invoice-id");
const $clientCompany = $(".client-company");
const $clientName = $(".client-name");
const $inputCount = $(".input-count");
const $inputPrice = $(".input-price");
const $subTotal = $(".sub-total");
const $vac = $(".vac");
const $total = $(".total");

const VAC = 0.19;

const getInvoiceTitle = (invoiceId) => {
  const name = $clientName.text()
                          .split(" ");
  const company = $clientCompany.text()
                                .split(" ");
  const title = [invoiceId, name.join("_"), company.join("_")]
    .join("_");

  return `${title}.pdf`;
};

const formatMoney = v =>
  accounting.formatMoney(v, {
    symbol: "€",
    format: "%v %s",
    decimal: ",",
    thousand: ".",
    precision: 2
  });
const unformatMoney = (v) => accounting.unformat(v, ", ");


const getCount = () => $inputCount.val();
const getPrice = () => $inputPrice.val();
const getSubTotal = (price, count) => {
  return price * count;
};
const getVac = (subTotal) => {
  return subTotal * VAC;
};
const updatePrice = (price, count) => {
  const subTotal = getSubTotal(unformatMoney(price), count);
  const vac = getVac(subTotal);
  $subTotal.text(formatMoney(subTotal));
  $vac.text(formatMoney(vac));
  $total.text(formatMoney(subTotal + vac));
};

$pdfButton.on("click", function() {
  if (window.print) {
    setTimeout(function() {
      window.print();
    }, 300);
  }
});
$invoiceId.on("change", function(v) {
  $("title")
    .text(getInvoiceTitle(v.currentTarget.value));
});
$inputCount.on("change", function(v) {
  updatePrice(getPrice(), v.currentTarget.value);
});
$inputPrice.on("change", function(v) {
  updatePrice(v.currentTarget.value, getCount());
});
