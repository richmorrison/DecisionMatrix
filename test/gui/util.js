const webdriver = require('selenium-webdriver')
const path = require('path');

const get_driver = function() {
  return new webdriver.Builder()
    // The "9515" is the port opened by ChromeDriver.
    .usingServer('http://localhost:9515')
    .withCapabilities({
      'goog:chromeOptions': {
        // Here is the path to your Electron binary.
        binary: path.join(__dirname, '../../node_modules/electron/dist/electron'),
        "args": ['--app=' + path.join(__dirname, "../../")]
      }
    })
    .forBrowser('chrome') // note: use .forBrowser('electron') for selenium-webdriver <= 3.6.0
    .build();
}

module.exports = {
  get_driver: get_driver
}
