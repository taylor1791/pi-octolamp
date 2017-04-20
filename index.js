const fetch = require('node-fetch');
const URL = 'http://api.sunrise-sunset.org/json?lat=40.3&lng=-111.8&formatted=0';

const period = {
  dawn: [7, 5],
  morning: [6],
  noon: [4, 6],
  afternoon: [6],
  dusk: [6, 7],
  night: [7],
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
  const dawn_start = new Date(spec.sunrise).getTime() + simpleDuration;
  const day_start = new Date(spec.sunrise).getTime() + 2 * simpleDuration;
  const noon_start = new Date(spec.solar_noon).getTime() - simpleDuration;
  const afternoon_start = new Date(spec.solar_noon).getTime() + simpleDuration;
  const dusk_start = new Date(spec.sunset).getTime() - 2 * simpleDuration;
  const night_start = new Date(spec.sunset).getTime() - simpleDuration;

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

