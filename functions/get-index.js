'use strict';

const co         = require("co");
const Promise    = require("bluebird");
const fs         = Promise.promisifyAll(require("fs"));
const Mustache   = require('mustache')
const http       = require('superagent-promise')(require('superagent'), Promise);

const restaurantsAPI = process.env.restaurantsAPI;
const days = ['Sunday', 'Monday', 'Tueday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var html;

function* loadHtml() {
  if (!html) {
    html = yield fs.readFileAsync('static/index.html', 'utf-8');
  }

  return html;
}

function* getRestaurants() {
  return (yield http.get(restaurantsAPI)).body;
}

module.exports.handler = co.wrap(function* (event, context, callback) {
  let template = yield loadHtml();
  let restaurants = yield getRestaurants();
  let dayOfWeek = days[new Date().getDay()];
  let html = Mustache.render(template, { dayOfWeek,  restaurants })
  const response = {
    statusCode: 200,
    body: html,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8'
    }
  };

  callback(null, response)
});
