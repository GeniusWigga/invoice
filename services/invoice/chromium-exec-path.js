const puppeteer = require("puppeteer");
const path = require("path");

const isPkg = typeof process.pkg !== "undefined";

let chromiumExecutablePath = (isPkg
    ? puppeteer.executablePath()
               .replace(
                 /^.*?\/node_modules\/puppeteer\/\.local-chromium/,
                 path.join(path.dirname(process.execPath), 'chromium')
               )
    : puppeteer.executablePath()
);

console.log('process: ', process);

if (process.platform == "win32") {
  chromiumExecutablePath = (isPkg ?
      puppeteer.executablePath().replace(
        /^.*?\\node_modules\\puppeteer\\\.local-chromium/,
        path.join(path.dirname(process.execPath), 'chromium')
      ) :
      puppeteer.executablePath()
  );
}

module.exports = chromiumExecutablePath;
