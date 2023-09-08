#!/usr/bin/env node
const fetch = require('node-fetch');
const URL = 'http://api.sunrise-sunset.org/json?lat=40.3&lng=-111.8&formatted=0';

const COLORS = {
  UVB: 4,
  BLUE: 5,
  WHITE: 6
};

const period = {
  dawn: [COLORS.BLUE, COLORS.WHITE],
  morning: [COLORS.WHITE],
  noon: [COLORS.UVB, COLORS.WHITE],
  afternoon: [COLORS.WHITE],
  dusk: [COLORS.WHITE, COLORS.BLUE],
  night: [COLORS.BLUE],
};

fetch(URL)
  .then(data => data.json())
  .then(data => {
    const time = determineTime(data.results, new Date());

    [4, 5, 6, 7].forEach(relay => {
      if (-1 === period[time].indexOf(relay)) {
        turnOff(relay);
      } else {
        turnOn(relay);
      }
    });
  });

function determineTime(spec, date) {
  const simpleDuration = spec.day_length / 24 * 1000; // tenth of a day in ms
  const dawn_start = new Date(spec.sunrise).getTime();
  const day_start = new Date(spec.sunrise).getTime() + 2 * simpleDuration;
  const noon_start = new Date(spec.solar_noon).getTime() - 2 * simpleDuration;
  const afternoon_start = new Date(spec.solar_noon).getTime() + 2 * simpleDuration;
  const dusk_start = new Date(spec.sunset).getTime() - 2 * simpleDuration;
  const night_start = new Date(spec.sunset).getTime();

  const now = Date.now();

  if (now < dawn_start) return 'night';
  if (now < day_start) return 'dawn';
  if (now < noon_start) return 'morning';
  if (now < afternoon_start ) return 'noon';
  if (now < dusk_start) return 'afternoon';
  if (now < night_start) return 'dusk';
  return 'night';
}

function turnOff(relay) {
  return turn(relay, 0);
}

function turnOn(relay) {
  return turn(relay, 1)
}

function turn(relay, state) {
  return fetch(`http://heliopolis.idagalaxy.com/relay/${relay}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({state}),
  });
}

