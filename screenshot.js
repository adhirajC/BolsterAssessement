const puppeteer = require('puppeteer');
var IPToASN = require('ip-to-asn');
var client = new IPToASN();
var mongoose = require('mongoose');

const uri = "mongodb+srv://adhiraj:YlV9lV1T034bHyO4@cluster0-r9mun.mongodb.net/bolster?retryWrites=true&w=majority";
var Schema   = mongoose.Schema;
mongoose.connect(uri, { useNewUrlParser: true });
var webSchema = new Schema({
  ip     : String,
 source  : String,
 dest    : String,
 ssl     : Array,
 text    : String,
 naturalText : String
});

var Web = mongoose.model('webs', webSchema);

const url = process.argv[2];
if (!url) {
    throw "Please provide URL as a first argument";
}
async function run () {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    const response = await page.goto(url);
    
    await page.screenshot({path: 'screenshot.png'});
    let chain = response.request().redirectChain();
    const ip = response.remoteAddress().ip;
    if (chain.length == 0){
        chain = url;
    } else {
        chain = chain[0];
    }
   
    const ssl = response.securityDetails();

    const[naturalText] = await Promise.all([page.waitForFunction(
        'document.querySelector("body").innerText',
      )]);

    const text = await Promise.all([response.text()]);

    var saveWeb = new Web({ip: ip, source: url, dest: chain, ssl: ssl, text: text, naturalText: naturalText});
    saveWeb.save(function (err, obj) {
        if (err) console.log(err);
        console.log(obj);
      });
    
    browser.close();
}


run();