require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');
const moment = require('moment-timezone');
const puppeteerService = require('./services/puppeteer.service');

const MUSTACHE_MAIN_DIR = './main.mustache';

let DATA = {
  refresh_date: new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'Asia/Kolkata',
  }),
};


let setWeatherInformation = async () => {

  let r = await fetch(`https://openweathermap.org/data/2.5/find?q=KOlkata&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`)
  let sun_rise_set = await fetch('https://api.sunrise-sunset.org/json?lat=22.5726&lng=88.3639&formatted=0');
  let rjson = await r.json();
  let rsunriseset = await sun_rise_set.json();
  DATA.city_temperature = Math.round((rjson.list[0].main.temp) / 10);
  DATA.city_weather = rjson.list[0].weather[0].description;
  DATA.city_weather_icon = rjson.list[0].weather[0].icon;

  let dtsr = moment(rsunriseset.results.sunrise, 'YYYY/MM/DD HH:mm:ss ZZ').tz('Asia/Kolkata').format('HH:mm');
  let dtss = moment(rsunriseset.results.sunset, 'YYYY/MM/DD HH:mm:ss ZZ').tz('Asia/Kolkata').format('HH:mm');
  DATA.sun_rise = dtsr + ' AM';
  DATA.sun_set = dtss + ' PM';

}

let setInstagramPosts = async () => {
  const instagramImages = await puppeteerService.getLatestInstagramPostsFromAccount('thisiskolkata', 3);
  DATA.img1 = instagramImages[0];
  DATA.img2 = instagramImages[1];
  DATA.img3 = instagramImages[2];
}

let generateReadMe = async () => {
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

let action = async () => {
  /**
   * Fetch Weather
   */
  await setWeatherInformation();

  /**
   * Get pictures
   */
  await setInstagramPosts();

  /**
   * Generate README
   */
  await generateReadMe();

  /**
   * Fermeture de la boutique 👋
   */
  await puppeteerService.close();
}

action();
