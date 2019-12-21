import json
from urllib.parse import quote, unquote

data = json.load(open('data/iclr2020_new.json'))
print(len(data))
new_data = []
def get_ratings(paper):
    ratings = []
    for review in paper['metadata']['reviews']:
        ratings.append(review['rating'])
    mean = sum(ratings)/len(ratings) if len(ratings) > 0 else 0
    variance = 0
    for i in ratings:
        variance += (i-mean)**2
    if len(ratings) > 0:
        variance /= len(ratings)
    variance = str(round(variance, 2))
    rating = str(round(mean, 2))
    return ratings, rating, variance
data = sorted(data, key=lambda x: get_ratings(x)[1], reverse=True)
idx = 1
for paper in data:
    ratings, rating, variance = get_ratings(paper)
    new_data.append(
        {
            'url': unquote(paper['pdf_link'].replace('pdf', 'forum')),
            'ratings': ratings,
            'abstract': paper['metadata']['abstract'],
            'authors': [],
            'emails': [],
            'title': paper['name'],
            'decision': paper['metadata']['decision'] if 'decision' in paper['metadata'] else None,
            'rating': rating,
            'variance': variance,
            'confidences': [],
            'rank': idx,
        }
    )
    idx += 1

json.dump(new_data, open('data/iclr2020.json', 'w'), indent=4)
