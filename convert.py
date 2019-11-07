import json

data = json.load(open('data/iclr2020_new.json'))
print(len(data))
print(data[0])
new_data = []
def get_ratings(paper):
    ratings = []
    for review in paper['metadata']['reviews']:
        ratings.append(review['rating'])
    rating = str(round(sum(ratings)/len(ratings) if len(ratings) > 0 else 0, 2)),
    return ratings, rating
data = sorted(data, key=lambda x: get_ratings(x)[1], reverse=True)
idx = 1
for paper in data:
    ratings, rating = get_ratings(paper)
    new_data.append(
        {
            'url': paper['pdf_link'].replace('pdf', 'forum'),
            'ratings': ratings,
            'abstract': paper['metadata']['abstract'],
            'authors': [],
            'emails': [],
            'title': paper['name'],
            'rating': rating,
            'confidences': [1,1,1],
            'rank': idx,
        }
    )
    idx += 1

json.dump(new_data, open('data/iclr2020.json', 'w'), indent=4)
