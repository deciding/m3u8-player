import requests
import sys

def get_top_k_url(text, k):
    ind='dsmh'
    j={
    "query": {
        "match": {
          "title": {
            "query": text,
            "fuzziness": 5,
            "operator":  "or"
          }
        }
      }
    }
    response = requests.post(f'http://127.0.0.1:9200/{ind}/_search?pretty&size={k}', json=j)
    res=response.json()['hits']['hits']
    indices=[hit['_source']['index'] for hit in res]
    titles=[hit['_source']['title'] for hit in res]
    #print(list(zip(titles, indices)))
    return indices

if __name__ == '__main__':
    print(' '.join(get_top_k_url(sys.argv[1], sys.argv[2])))
