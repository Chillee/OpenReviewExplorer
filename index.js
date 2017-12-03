
var options = {
  valueNames: ['rank', 'rating', 'title', 'ratings', 'confidences', 'extra'],
  item: `<tr><td class="rank"></td><td class="rating" ></td><td class="title"></td><td class="ratings"></td><td class="confidences"></td><td class="extra break" onclick="toggleAbstract(this)"></td></tr>`
};
var request = new XMLHttpRequest();
request.open('GET', 'data.json', false);
request.send(null);
var data = JSON.parse(request.responseText);

for (let i=0; i<data.length; i++) {
    data[i]['title'] = `<a href=${data[i]['url']}>${data[i]['title']}</a>`;
    data[i]['oldtitle'] = data[i]['title'];
    data[i]['extra'] = `<i class="fa fa-chevron-down"></i>`;
}
let list = new List('users', options, data);
list.sort('rating', { order: 'desc' });
function updateHighlights() {
    let searchString = document.getElementById('search').value.toLowerCase();
    if (searchString.length < 3) {
        searchString='akfdjhlhsajlshkfdajkhlsajfsahlkfdjldsajhkfkajhlfdshjl';
    }
    let items = list.matchingItems;
    console.log(searchString);
    let strings = [searchString, searchString[0].toUpperCase() + searchString.slice(1), searchString.toUpperCase()];
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
    updateHighlights();
})

// function closeAbstract(rank) {
//     let paper = list.get("rank", rank)[0];
//     let curValues = paper._values;
//     curValues.extra = `<span onclick="expandAbstract(${curValues['rank']})"><i class="fa fa-expand" aria-hidden="true"></i></span>`;
//     curValues.abstract;
//     paper.values(curValues);
// }
// function expandAbstract(rank) {
//     let paper = list.get("rank", rank)[0];
//     let curValues = paper._values;
//     curValues.extra = `<span onclick="closeAbstract(${curValues['rank']})">${curValues.abstract}"</span>`;
//     paper.values(curValues);
// }

function toggleAbstract(x) {
    let rank = x.parentNode.getElementsByClassName('rank')[0].innerText;
    let paper = list.get("rank", rank)[0];
    let curValues = paper._values;
    if (curValues.extra.indexOf('fa-chevron-downt') === -1) {
        curValues.extra = `<i class="fa fa-chevron-down" aria-hidden="true"></i>`;
        x.parentNode.nextSibling.remove();
    } else {
        curValues.extra = `<i class="fa fa-chevron-up" aria-hidden="true"></i>`;
        let abstractNode = document.createElement('tr');
        abstractNode.innerHTML = `<td colspan="100">${curValues.abstract.replace(/\n/gm, "")}</td>`
        x.parentNode.parentNode.insertBefore(abstractNode, x.parentNode.nextSibling);
    }
    // paper.values(curValues);
    updateHighlights();
}