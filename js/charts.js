function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


let request = new XMLHttpRequest();

let conference = getParameterByName('conf');
if (!conference) {
    conference = 'iclr2018';
}
document.querySelector('h1').textContent = `${conference.toUpperCase()} Open Review Explorer`
request.open('GET', `data/${conference}.json`, false);
request.send(null);
var data = JSON.parse(request.responseText);

let x = [];
for (let paper of data) {
  x.push(parseFloat(paper['rating']));
}
var trace = {
  x: x,
  type: 'histogram',
  autobinx: false,
  xbins: {
    end: 10.0,
    start: 0.0,
    size: 0.5,
  },
};
var data = [trace];
let layout = {
  title: 'Paper Average Score Distribution',
};
Plotly.newPlot('histogram', data, layout);

var trace = {
  x: x,
  type: 'histogram',
  histnorm: 'probability',
  cumulative: { enabled: true },
  autobinx: false,
  xbins: {
    end: 10.0,
    start: 0.0,
    size: 0.01,
  },
};
let cumdata = [trace];
let cumlayout = {
  title: 'Paper Cumulative Score Distribution',
  shapes: [
    {
      type: 'line',
      x0: 0,
      x1: 10,
      y0: 0.5,
      y1: 0.5,
      line: {
        color: 'rgb(255,165,0)',
        width: 3,
      },
    },
    {
      type: 'line',
      x0: 0,
      x1: 10,
      y0: 0.7,
      y1: 0.7,
      line: {
        color: 'rgb(173,255,47)',
        width: 3,
      },
    },
  ],
};
Plotly.newPlot('cumulative', cumdata, cumlayout);
