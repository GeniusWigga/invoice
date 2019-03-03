const fs = require("fs");
const util = require("util");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const readFile = util.promisify(fs.readFile);

async function html(templatePath, data = {}) {
  try {
    const content = await readFile(templatePath, "utf8");
    handlebars.registerHelper("equal", (v, p) => v === p);
    const template = handlebars.compile(content);

    return template(data);
  } catch (error) {
    return error;
  }
}

async function pdf(content) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.emulateMedia("print");
    await page.setContent(content);

    return page.pdf({ printBackground: true });
  } catch (error) {
    return error;
  }
}

module.exports = {
  html: html,
  pdf: pdf
};
