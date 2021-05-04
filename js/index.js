RegExp.escape = function (s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

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
  conference = 'iclr2021';
}
document.querySelector('h1').textContent = `${conference.toUpperCase()} Open Review Explorer`
console.log(`${conference}.json`)
request.open('GET', `data/${conference}.json`, false);
request.send(null);

console.log(request);
let data = JSON.parse(request.responseText);
let upChevronHTML = `<i class="fa fa-chevron-up" aria-hidden="true"></i>`;
let downChevronHTML = `<i class="fa fa-chevron-down" aria-hidden="true"></i>`;

for (let i = 0; i < data.length; i++) {
  data[i]['title'] = `<a href=${data[i]['url']} target="_blank">${data[i]['title']}</a>`;
  data[i]['oldtitle'] = data[i]['title'];
  data[i]['olddecision'] = data[i]['decision'];
  data[i]['extra'] = downChevronHTML;
}

let config = {
  rank: `<td class="rank"></td>`,
  rating: `<td class="rating"></td>`,
  title: `<td class="title"></td>`,
  ratings: `<td class="ratings"></td>`,
  variance: `<td class="variance"></td>`,
  confidences: `<td class="confidences"></td>`,
  decision: `<td class="decision"></td>`,
  citations: `<td class="citations"></td>`,
  karpathy: `<td class="karpathy"></td>`,
  extra: `<td class="extra" onclick="toggleAbstract(this)"></td>`,
};
let options = {
  valueNames: [],
  item: ['<tr>'],
  page: parseInt(getParameterByName('limit')) || 200
};


let tableHead = document.querySelector('#table > thead > tr');
for (const i in config) {
  if (data[0][i] !== undefined) {
    options.valueNames.push(i);
    options.item.push(config[i]);
  } else {
    let header = document.querySelector(`#table > thead > tr > th[data-sort="${i}"]`);
    header.remove();
  }
}

options.item.push('</tr>');
options.item = options.item.join('');
let list = new List('users', options, data);
list.sort('rank', { order: 'asc' });
if (options.page >= data.length) {
  document.getElementById('showAll').remove();
}

function updateSearchResultCount() {
  let sum = 0;
  let results = [0, 0, 0, 0];
  for (let i = 0; i < list.matchingItems.length; i++) {
    let item = list.matchingItems[i]._values;
    if (item.rating === ' N/A') {
      continue;
    }
    sum += parseFloat(item.rating);
    if (!item.decision) {
      continue;
    }
    if (item.decision.indexOf('Oral') !== -1) {
      results[0]++;
    } else if (item.decision.indexOf('Poster') !== -1) {
      results[1]++;
    } else if (item.decision.indexOf('Workshop') !== -1) {
      results[2]++;
    } else if (item.decision.indexOf('Reject') !== -1) {
      results[3]++;
    }
  }
  document.getElementById('search_results').textContent =
    ` ${list.matchingItems.length} results, ${(sum / list.matchingItems.length).toFixed(2)} mean, ${results[0]} orals, ${results[1]} posters, ${results[2]} workshops, ${results[3]} rejections`;
}
updateSearchResultCount();
updateDisplay();

function updateHighlights() {
  let searchString = document.getElementById('search').value.toLowerCase();
  if (searchString.length < 3) {
    searchString = 'akfdjhlhsajlshkfdajkhlsajfsahlkfdjldsajhkfkajhlfdshjl';
  }
  let items = list.matchingItems;
  let highlightInString = x => {
    if (!x) {
      return x;
    }
    return x.replace(new RegExp(RegExp.escape(searchString), 'ig'), match => {
      return `<span class="highlight">${match}</span>`;
    });
  };
  for (const item of items) {
    let newValues = item._values;
    newValues.title = highlightInString(newValues.oldtitle);
    newValues.decision = highlightInString(newValues.olddecision);
    item.values(newValues);
  }
  let table = document.querySelectorAll('#table > tbody > tr');
  for (let tr of table) {
    if (tr.children.length === 1) {
      tr.children[0].innerHTML = highlightInString(tr.children[0].innerHTML);
    }
  }
}

function resetChevrons() {
  let items = list.matchingItems;
  for (const item of items) {
    let newValues = item._values;
    newValues.extra = downChevronHTML;
    item.values(newValues);
  }
}

function updateDisplay() {
  let decisionCells = document.querySelectorAll('#table > tbody > tr > td.decision');
  let decisionColors = {
    oral: '#CCFFFF',
    reject: '#FFCCCC',
    poster: '#CCFFCC',
    workshop: '#FFFFCC',
  };
  for (const cell of decisionCells) {
    if (cell.textContent.indexOf('Oral') !== -1 || cell.textContent.indexOf('Spotlight') !== -1 || cell.textContent.indexOf('Talk') !== -1) {
      cell.style.background = decisionColors['oral'];
    } else if (cell.textContent.indexOf('Reject') !== -1) {
      cell.style.background = decisionColors['reject'];
    } else if (cell.textContent.indexOf('Poster') !== -1) {
      cell.style.background = decisionColors['poster'];
    } else if (cell.textContent.indexOf('Workshop') !== -1) {
      cell.style.background = decisionColors['workshop'];
    } else {
      cell.style.background = '';
    }
  }
}

list.on('searchComplete', e => {
  document.getElementById('search_results').textContent = ` ${list.matchingItems.length}`;
  let searchString = document.getElementById('search').value.toLowerCase();
  updateSearchResultCount();
  updateHighlights();
  resetChevrons();
});

list.on('sortStart', e => {
  updateDisplay();
  updateHighlights();
  resetChevrons();
});

function toggleAbstract(x) {
  let rank = x.parentNode.getElementsByClassName('rank')[0].innerText;
  let paper = list.get('rank', rank)[0];
  let curValues = paper._values;
  if (curValues.extra.indexOf('fa-chevron-down') === -1) {
    curValues.extra = downChevronHTML;
    x.parentNode.nextSibling.remove();
  } else {
    curValues.extra = upChevronHTML;
    let abstractNode = document.createElement('tr');
    abstractNode.innerHTML =
      `<td colspan="100">Authors: ${curValues.authors.join(', ')} <br> Emails: ${curValues.emails.join(', ')} <br> ${curValues.abstract.replace(/\n/gm, ' ')} </td>`;
    x.parentNode.parentNode.insertBefore(abstractNode, x.parentNode.nextSibling);
    updateHighlights();
  }
  paper.values(curValues);
}

function showAll() {
  let url = new URL(location.href);
  url.searchParams.set('limit', 1000000000);
  document.location = url;
}