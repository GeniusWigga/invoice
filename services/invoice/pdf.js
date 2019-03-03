const fs = require("fs");
const util = require("util");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const readFile = util.promisify(fs.readFile);
const chromiumExecutablePath = require("./chromium-exec-path");

async function html(templatePath, data = {}) {
  try {
    const content = await readFile(templatePath, 'utf8');
    handlebars.registerHelper('equal', (v, p) => v === p);
    const template = handlebars.compile(content);

    return template(data);
  } catch (error) {
    return error;
  }
}

async function pdf(content) {
  try {
    const browser = await puppeteer.launch({ executablePath: chromiumExecutablePath });
    const page = await browser.newPage();
    await page.waitFor('*');
    await page.setContent(content, {
      waitUntil: ['domcontentloaded', 'networkidle0']
    });
    await page.emulateMedia('print');

    const pdf = await page.pdf();
    await browser.close();
    return pdf;
  } catch (error) {
    return error;
  }
}

module.exports = {
  html: html,
  pdf: pdf
};
