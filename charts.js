var request = new XMLHttpRequest();
request.open('GET', 'data.json', false);
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
