
var options = {
  valueNames: ['rank', 'rating', 'title', 'ratings', 'confidences', 'extra'],
  item: `<tr><td class="rank"></td><td class="rating" ></td><td class="title"></td><td class="ratings"></td><td class="confidences"></td><td class="extra break" onclick="toggleAbstract(this)"></td></tr>`
};
var request = new XMLHttpRequest();
request.open('GET', 'data.json', false);
request.send(null);
var data = JSON.parse(request.responseText);

for (let i=0; i<data.length; i++) {
    data[i]['title'] = `<a href=${data[i]['url']} target="_blank">${data[i]['title']}</a>`;
    data[i]['oldtitle'] = data[i]['title'];
    data[i]['extra'] = `<i class="fa fa-chevron-down"></i>`;
}
let list = new List('users', options, data);
list.sort('rank', { order: 'asc' });
function updateSearchResults() {
    document.getElementById('search_results').textContent = ` ${list.matchingItems.length} results`;
}
updateSearchResults();

function updateHighlights() {
    let searchString = document.getElementById('search').value.toLowerCase();
    if (searchString.length < 3) {
        searchString='akfdjhlhsajlshkfdajkhlsajfsahlkfdjldsajhkfkajhlfdshjl';
    }
    let items = list.matchingItems;
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
    let strings = [searchString, toTitleCase(searchString), searchString.toUpperCase()];
    let highlightInString = (str) => {
        for (let s of strings) {
            str = str.replace(s, `<span class="highlight">${s}</span>`);
        }
        return str;
    }
    for (const item of items) {
        let newValues = item._values;
        newValues.title = highlightInString(newValues.oldtitle);
        item.values(newValues);
    }
    let table = document.querySelectorAll('#table > tbody > tr');
    for (let tr of table) {
        if (tr.children.length === 1) {
            tr.children[0].innerHTML = highlightInString(tr.children[0].innerHTML);
        }
    }
}
list.on('searchComplete', (e) => {
    document.getElementById('search_results').textContent = ` ${list.matchingItems.length}`;
    updateSearchResults();
    updateHighlights();
})

function toggleAbstract(x) {
    let rank = x.parentNode.getElementsByClassName('rank')[0].innerText;
    let paper = list.get("rank", rank)[0];
    let curValues = paper._values;
    if (curValues.extra.indexOf('fa-chevron-down') === -1) {
        curValues.extra = `<i class="fa fa-chevron-down" aria-hidden="true"></i>`;
        x.parentNode.nextSibling.remove();
    } else {
        curValues.extra = `<i class="fa fa-chevron-up" aria-hidden="true"></i>`;
        let abstractNode = document.createElement('tr');
        abstractNode.innerHTML = `<td colspan="100">${curValues.abstract.replace(/\n/gm, "")}</td>`
        x.parentNode.parentNode.insertBefore(abstractNode, x.parentNode.nextSibling);
        updateHighlights();
    }
    paper.values(curValues);
}