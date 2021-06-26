require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');
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

async function setWeatherInformation() {

  await fetch(
    `https://openweathermap.org/data/2.5/find?q=KOlkata&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`

  )

    //r = await r.json();
    .then((r) => r.json())
    .then(r => {
      DATA.city_temperature = Math.round(r.list[0].main.temp);
      DATA.city_weather = r.list[0].weather[0].description;
      DATA.city_weather_icon = r.list[0].weather[0].icon;
      // DATA.sun_rise = new Date(r.list[0].sys.sunrise * 1000).toLocaleString('en-GB', {
      //   hour: '2-digit',
      //   minute: '2-digit',
      //   timeZone: 'Asia/Kolkata',
      // });
      // DATA.sun_set = new Date(r.list[0].sys.sunset * 1000).toLocaleString('en-GB', {
      //   hour: '2-digit',
      //   minute: '2-digit',
      //   timeZone: 'Asia/Kolkata',
      // });
    });
}

async function setInstagramPosts() {
  const instagramImages = await puppeteerService.getLatestInstagramPostsFromAccount('thisiskolkata', 3);
  DATA.img1 = instagramImages[0];
  DATA.img2 = instagramImages[1];
  DATA.img3 = instagramImages[2];
}

async function generateReadMe() {
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
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
