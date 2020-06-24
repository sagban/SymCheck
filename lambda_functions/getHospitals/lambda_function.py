import json
# import requests
import urllib3
from botocore.vendored import requests


def lambda_handler(event, context):
    
    location = event['location']
    BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?'
    API_KEY = 'AIzaSyAfGgl49L8d89c9_ut7TTW2NQ4D8Fqjjq0'
    rankby = 'distance'
    keyword = 'COVID-19+testing+lab'
    url = BASE_URL+'location='+location+'&keyword='+keyword+'&rankby='+rankby+'&key='+API_KEY
    http = urllib3.PoolManager()
    resp = http.request('GET', url)
    data = resp.data.decode('utf-8')
    data = json.loads(data)
    results = data['results']
    elements = []
    
    
    for result in results[:10]:
      # print(result)
      newElementObj = {
        "title": result['name'],
        "subtitle": result['vicinity'],
        "image_url": result['icon'],
        "action_url": "https://www.google.co.in/maps/@"+str(result['geometry']['location']['lat'])+","+str(result['geometry']['location']['lng'])+",16z",
        "buttons": []
      }
      elements.append(newElementObj)
    
    res = {
      "version": "v2",
      "content": {
        "messages": [
          {
            "type": "cards",
            "elements": elements,
            "image_aspect_ratio": "horizontal"
          }
        ],
        "actions": [],
        "quick_replies": []
      }
    }
    return res
