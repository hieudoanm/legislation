import json
import requests

url = "https://restcountries.com/v3.1/all?fields=name"

response = requests.get(url)
countries = response.json()

names = sorted([x["name"]["common"] for x in countries])

with open("json/countries.json", "w") as f:
    json.dump(names, f, indent=2)
