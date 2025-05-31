# Introduction

Use the TwelveLabs Video Understanding API to extract information from your videos and make it available to your applications. The API is organized around REST and returns responses in JSON format. It is compatible with most programming languages, and you can use one of the [available SDKs](/v1.3/docs/resources/twelve-labs-sd-ks), Postman, or other REST clients to interact with the API.

# Call an endpoint

To call an endpoint, you must construct a URL similar to the following one:

`{Method} {BaseURL}/{version}/{resource}/{path_parameters}?{query_parameters}`

The list below describes each component of a request:

* **Method**: The API supports the following methods:
  * `GET`: Reads data.
  * `POST`: Creates a new object or performs an action.
  * `PUT`: Updates an object.
  * `DELETE`: Deletes an object.\
    Note that the `POST` and `PUT` methods require you to pass a request body containing additional parameters.
* **Base URL**: The base URL of the API is `https://api.twelvelabs.io`.
* **Version**: To use this version of the API, it must be set to `v1.3`.
* **Resource**: The name of the resource you want to interact with.
* **Path Parameters**: Allow you to indicate a specific object. For example, you can retrieve details about an engine or index.
* **Query Parameters**: Any parameters that an endpoint accepts. For example, you can filter] or sort a response using query parameters.

Note that the API requires you to pass a header parameter containing your API key to authenticate each request. For details, see the [Authentication](/v1.3/api-reference/authentication) page.

# Responses

TwelveLabs Video Understanding API follows the RFC 9110 standard to indicate the success or failure of a request. Each response contains a field named `X-Api-Version` that indicates the version of the API against which the operation was performed.

## HTTP status codes

The following list is a summary of the HTTP status codes returned by the API:

* `200`: The request was successful.
* `201`: The request was successful and a new resource was created.
* `400`: The API service cannot process the request. See the `code` and `message` fields in the response for more details about the error.
* `401`: The API key you provided is not valid. Note that, for security reasons, your API key automatically expires every two months. When your key has expired, you must generate a new one to continue using the API. For details, see the [Authentication](/v1.3/docs/guides/authentication) page.
* `404`: The requested resource was not found.
* `429`: Indicates that a rate limit has been reached.

## Errors

HTTP status codes in the `4xx` range indicate an error caused by the parameters you provided in the request. For each error, the API service returns the following fields in the body of the response:

* `code`: A string representing the error code.
* `message`: A human-readable string describing the error, intended to be suitable for display in a user interface.
* *(Optional)* `docs_url`: The URL of the relevant documentation page.

For more details, see the [Error codes](/v1.3/api-reference/error-codes) page.


# Authentication

To make HTTP requests, you must include the API key in the header of each request.

# Prerequisites

To use the platform, you need an API key:


  
    If you don’t have an account, [sign up](https://playground.twelvelabs.io/) for a free account.
  

  
    Go to the [API Key](https://playground.twelvelabs.io/dashboard/api-key) page.
  

  
    Select the **Copy** icon next to your key.
  


# Procedure


  
    Verify that the required packages are installed on your system. If necessary, install the following packages:

    
      
        Install the `requests` package by entering the following command:

        ```shell
        python -m pip install requests
        ```
      

      
        Install the `axios` and `form-data` packages by entering the following command:

        ```shell
        npm install axios form-data
        ```
      
    
  

  
    Define the URL of the API and the specific endpoint for your request.
  

  
    Create the necessary headers for authentication.
  

  
    Prepare the data payload for your API request.
  

  
    Send the API request and process the response.
  


Below are complete code examples for Python and Node.js, integrating all the steps outlined above:


  
    ```Python Python
    import requests

    # Step 2: Define the API URL and the specific endpoint
    API_URL = "https://api.twelvelabs.io/v1.3"
    INDEXES_URL = f"{API_URL}/indexes"

    # Step 3: Create the necessary headers for authentication
    headers = {
        "x-api-key": ""
    }

    # Step 4: Prepare the data payload for your API request
    INDEX_NAME = ""
    data = {
        "models": [
            {
                "model_name": "marengo2.7",
                "model_options": ["visual", "audio"]
            }
        ],
        "index_name": INDEX_NAME
    }

    # Step 5: Send the API request and process the response
    response = requests.post(INDEXES_URL, headers=headers, json=data)
    print(f"Status code: {response.status_code}")
    if response.status_code == 201:
        print(response.json())
    else:
        print("Error:", response.json())
    ```
  

  
    ```Javascript Node.js
    const axios = require('axios');

    // Step 2: Define the API URL and the specific endpoint
    const API_URL = 'https://api.twelvelabs.io/v1.3';
    const INDEXES_URL = `${API_URL}/indexes`;

    // Step 3: Create the necessary headers for authentication
    const headers = {
        'x-api-key': ''
    };

    // Step 4: Prepare the data payload for your API request
    const INDEX_NAME = '';
    const data = {
        models: [
            {
                model_name: 'marengo2.7',
                model_options: ['visual', 'audio']
            }
        ],
        index_name: INDEX_NAME
    };

    // Step 5: Send the API request and process the response
    axios.post(INDEXES_URL, data, { headers })
        .then(resp => {
            console.log(`Status code: ${resp.status}`);
            console.log(resp.data);
        })
        .catch(error => {
            console.error(`Error: ${error.response.status} - ${error.response.data.message}`);
        });
    ```
  



# Typical workflows

This page provides an overview of common workflows for interacting with the TwelveLabs Video Understanding Platform using an HTTP client. Each workflow consists of a series of steps, with links to detailed documentation for each step.

All workflows involving uploading video content to the platform require asynchronous processing. You must wait for the video processing to complete before proceeding with the subsequent steps.

# Authentication

The API uses keys for authentication. For details, see the [Authentication](/v1.3/api-reference/authentication) page.

# Search

Follow the steps in this section to search through your video content and find specific moments, scenes, or information.

**Steps**:

1. [Create an index](/v1.3/api-reference/indexes/create), enabling the Marengo video understanding model.
2. [Upload videos](/v1.3/api-reference/tasks/create) and [monitor the processing](/v1.3/api-reference/tasks/retrieve).
3. [Perform a search request](/v1.3/api-reference/any-to-video-search/make-search-request-1),  using text or images as queries.


  * The search scope is an individual index.
  * Results support pagination, filtering, sorting, and grouping.


For an interactive implementation using the [Python SDK](https://github.com/twelvelabs-io/twelvelabs-python), see the [Quickstart Search](https://colab.research.google.com/github/twelvelabs-io/twelvelabs-developer-experience/blob/main/quickstarts/TwelveLabs_Quickstart_Search.ipynb) quickstart notebook.

# Generate text from videos

Follow the steps in this section to generate texts based on your videos.

**Steps**:

1. [Create an index](/v1.3/api-reference/indexes/create), enabling the Pegasus video understanding model.
2. [Upload videos](/v1.3/api-reference/tasks/create) and [monitor the processing](/v1.3/api-reference/tasks/retrieve).
3. Depending on your use case, generate one of the following:
   * [Summaries, chapters, and highlights](/v1.3/api-reference/generate-text-from-video/summarize)
   * [Open-ended texts](/v1.3/api-reference/generate-text-from-video/open-ended).

For an interactive implementation using the [Python SDK](https://github.com/twelvelabs-io/twelvelabs-python), see the [Quickstart Generate](https://colab.research.google.com/github/twelvelabs-io/twelvelabs-developer-experience/blob/main/quickstarts/TwelveLabs_Quickstart_Generate.ipynb) quickstart notebook.

# Create text, image, and audio embeddings

This workflow guides you through creating embeddings for text.

**Steps**:

1. [Create text, image, and audio embeddings](/v1.3//api-reference/text-image-audio-embeddings/create-text-image-audio-embeddings).


  Creating text, image, and audio embeddings is a synchronous process.


# Create video embeddings

This workflow guides you through creating embeddings for videos.

**Steps**:

1. [Upload a video](/v1.3/api-reference/video-embeddings/create-video-embedding-task) and [monitor the processing](/v1.3/api-reference/video-embeddings/retrieve-video-embedding-task-status).
2. [Retrieve the embeddings](/v1.3/api-reference/video-embeddings/retrieve-video-embeddings).


  Creating video embeddings is a synchronous process.


For an interactive implementation using the [Python SDK](https://github.com/twelvelabs-io/twelvelabs-python), see the [Quickstart Embed](https://colab.research.google.com/github/twelvelabs-io/twelvelabs-developer-experience/blob/main/quickstarts/TwelveLabs_Quickstart_Embeddings.ipynb) quickstart notebook.


# Manage indexes

An index is a basic unit for organizing and storing video data consisting of ideo embeddings and metadata. Indexes facilitate information retrieval and processing. You can use this endpoint to manage your indexes.

**Related guide**: [Create an index](/v1.3/docs/concepts/indexes#create-an-index).


# The index object

The `index` object is composed of the following fields:

* `_id`: A string representing the unique identifier of the index. It is assigned by the API when an index is created.
* `index_name`: A string representing the name of the index.
* `models`: An array that specifies the [video understanding models](/v1.3/docs/concepts/models) and the [model options](/v1.3/docs/concepts/modalities#model-options) that are enabled for this index. This determines how the platform processes your videos.
* `created_at`: A string representing the date and time, in the RFC 3339 format, that the index was created.
* `updated_at`: A string representing the date and time, in the RFC 3339 format, that the index was updated.
* `expires_at`: A string representing the date and time, in the RFC 3339 format, when your index will expire.
* `video_count`: An integer representing the number of videos in the index.
* `total_duration`: An integer representing the total duration of the videos in the index.
* `addons`: The list of add-ons that are enabled for this index.


# Create an index

```http
POST https://api.twelvelabs.io/v1.3/indexes
Content-Type: application/json
```

This method creates an index.




## Response Body

- 201: An index has successfully been created
- 400: The request has failed.

## Examples

```shell indexes_create_example
curl -X POST https://api.twelvelabs.io/v1.3/indexes \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "index_name": "myIndex",
  "models": [
    {
      "model_name": "marengo2.7",
      "model_options": [
        "visual",
        "audio"
      ]
    },
    {
      "model_name": "pegasus1.2",
      "model_options": [
        "visual",
        "audio"
      ]
    }
  ],
  "addons": [
    "thumbnail"
  ]
}'
```

```python indexes_create_example
import requests

url = "https://api.twelvelabs.io/v1.3/indexes"

payload = { "index_name": "myIndex" }
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript indexes_create_example
const url = 'https://api.twelvelabs.io/v1.3/indexes';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"index_name":"myIndex"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go indexes_create_example
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes"

	payload := strings.NewReader("{\n  \"index_name\": \"myIndex\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby indexes_create_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"index_name\": \"myIndex\"\n}"

response = http.request(request)
puts response.read_body
```

```java indexes_create_example
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/indexes")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"index_name\": \"myIndex\"\n}")
  .asString();
```

```php indexes_create_example
request('POST', 'https://api.twelvelabs.io/v1.3/indexes', [
  'body' => '{
  "index_name": "myIndex"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp indexes_create_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"index_name\": \"myIndex\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift indexes_create_example
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = ["index_name": "myIndex"] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/indexes \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "index_name": "string",
  "models": [
    {
      "model_name": "string",
      "model_options": [
        "string"
      ]
    }
  ]
}'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/indexes"

payload = { "index_name": "string" }
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/indexes';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"index_name":"string"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes"

	payload := strings.NewReader("{\n  \"index_name\": \"string\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"index_name\": \"string\"\n}"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/indexes")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"index_name\": \"string\"\n}")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/indexes', [
  'body' => '{
  "index_name": "string"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"index_name\": \"string\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = ["index_name": "string"] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# List indexes

```http
GET https://api.twelvelabs.io/v1.3/indexes
```

This method returns a list of the indexes in your account. The API returns indexes sorted by creation date, with the oldest indexes at the top of the list.




## Query Parameters

- Page (optional): A number that identifies the page to retrieve.

**Default**: `1`.

- PageLimit (optional): The number of items to return on each page.

**Default**: `10`.
**Max**: `50`.

- SortBy (optional): The field to sort on. The following options are available:
- `updated_at`: Sorts by the time, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"), when the item was updated.
- `created_at`: Sorts by the time, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"), when the item was created.

**Default**: `created_at`.

- SortOption (optional): The sorting direction. The following options are available:
- `asc`
- `desc`

**Default**: `desc`.

- IndexName (optional): Filter by the name of an index.
- ModelOptions (optional): Filter by the model options. When filtering by multiple model options, the values must be comma-separated.

- ModelFamily (optional): Filter by the model family. This parameter can take one of the following values: `marengo` or `pegasus`. You can specify a single value.

- CreatedAt (optional): Filter indexes by the creation date and time, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"). The platform returns the indexes that were created on the specified date at or after the given time.

- UpdatedAt (optional): Filter indexes by the last update date and time, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"). The platform returns the indexes that were last updated on the specified date at or after the given time.


## Response Body

- 200: The indexes have successfully been retrieved.
- 400: The request has failed.

## Examples

```shell listExample
curl -G https://api.twelvelabs.io/v1.3/indexes \
     -H "x-api-key: " \
     -d index_name=myIndex \
     --data-urlencode model_options=visual,audio \
     -d model_family=marengo \
     --data-urlencode created_at=2024-08-16T16:53:59Z \
     --data-urlencode updated_at=2024-08-16T16:55:59Z
```

```python listExample
import requests

url = "https://api.twelvelabs.io/v1.3/indexes"

querystring = {"index_name":"myIndex","model_options":"visual,audio","model_family":"marengo","created_at":"2024-08-16T16:53:59Z","updated_at":"2024-08-16T16:55:59Z"}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript listExample
const url = 'https://api.twelvelabs.io/v1.3/indexes?index_name=myIndex&model_options=visual%2Caudio&model_family=marengo&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A55%3A59Z';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go listExample
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes?index_name=myIndex&model_options=visual%2Caudio&model_family=marengo&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A55%3A59Z"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby listExample
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes?index_name=myIndex&model_options=visual%2Caudio&model_family=marengo&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A55%3A59Z")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java listExample
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/indexes?index_name=myIndex&model_options=visual%2Caudio&model_family=marengo&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A55%3A59Z")
  .header("x-api-key", "")
  .asString();
```

```php listExample
request('GET', 'https://api.twelvelabs.io/v1.3/indexes?index_name=myIndex&model_options=visual%2Caudio&model_family=marengo&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A55%3A59Z', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp listExample
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes?index_name=myIndex&model_options=visual%2Caudio&model_family=marengo&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A55%3A59Z");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift listExample
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes?index_name=myIndex&model_options=visual%2Caudio&model_family=marengo&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A55%3A59Z")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -G https://api.twelvelabs.io/v1.3/indexes \
     -H "x-api-key: " \
     -d page=0 \
     -d page_limit=0
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/indexes"

querystring = {"page":"0","page_limit":"0"}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/indexes?page=0&page_limit=0';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes?page=0&page_limit=0"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes?page=0&page_limit=0")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/indexes?page=0&page_limit=0")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/indexes?page=0&page_limit=0', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes?page=0&page_limit=0");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes?page=0&page_limit=0")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Retrieve an index

```http
GET https://api.twelvelabs.io/v1.3/indexes/{index-id}
```

This method retrieves details about the specified index.




## Path Parameters

- Index-Id (required): Unique identifier of the index to retrieve.


## Response Body

- 200: The specified index has successfully been retrieved.
- 400: The request has failed.

## Examples

```shell indexes_retrieve_example
curl https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c \
     -H "x-api-key: "
```

```python indexes_retrieve_example
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript indexes_retrieve_example
const url = 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go indexes_retrieve_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby indexes_retrieve_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java indexes_retrieve_example
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c")
  .header("x-api-key", "")
  .asString();
```

```php indexes_retrieve_example
request('GET', 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp indexes_retrieve_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift indexes_retrieve_example
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl https://api.twelvelabs.io/v1.3/indexes/:index-id \
     -H "x-api-key: "
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Update an index

```http
PUT https://api.twelvelabs.io/v1.3/indexes/{index-id}
Content-Type: application/json
```

This method updates the name of the specified index.




## Path Parameters

- Index-Id (required): Unique identifier of the index to update.


## Response Body


- 400: The request has failed.

## Examples

```shell indexes_update_example
curl -X PUT https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "index_name": "myIndex"
}'
```

```python indexes_update_example
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c"

payload = { "index_name": "myIndex" }
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.put(url, json=payload, headers=headers)

print(response.json())
```

```javascript indexes_update_example
const url = 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c';
const options = {
  method: 'PUT',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"index_name":"myIndex"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go indexes_update_example
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c"

	payload := strings.NewReader("{\n  \"index_name\": \"myIndex\"\n}")

	req, _ := http.NewRequest("PUT", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby indexes_update_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"index_name\": \"myIndex\"\n}"

response = http.request(request)
puts response.read_body
```

```java indexes_update_example
HttpResponse response = Unirest.put("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"index_name\": \"myIndex\"\n}")
  .asString();
```

```php indexes_update_example
request('PUT', 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c', [
  'body' => '{
  "index_name": "myIndex"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp indexes_update_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c");
var request = new RestRequest(Method.PUT);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"index_name\": \"myIndex\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift indexes_update_example
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = ["index_name": "myIndex"] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "PUT"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X PUT https://api.twelvelabs.io/v1.3/indexes/:index-id \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "index_name": "string"
}'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id"

payload = { "index_name": "string" }
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.put(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id';
const options = {
  method: 'PUT',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"index_name":"string"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id"

	payload := strings.NewReader("{\n  \"index_name\": \"string\"\n}")

	req, _ := http.NewRequest("PUT", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"index_name\": \"string\"\n}"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.put("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"index_name\": \"string\"\n}")
  .asString();
```

```php
request('PUT', 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id', [
  'body' => '{
  "index_name": "string"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id");
var request = new RestRequest(Method.PUT);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"index_name\": \"string\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = ["index_name": "string"] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "PUT"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Delete an index

```http
DELETE https://api.twelvelabs.io/v1.3/indexes/{index-id}
```

This method deletes the specified index and all the videos within it. This action cannot be undone.



## Path Parameters

- Index-Id (required): Unique identifier of the index to delete.


## Response Body


- 400: The request has failed.

## Examples

```shell deleteExample
curl -X DELETE https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c \
     -H "x-api-key: "
```

```python deleteExample
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c"

headers = {"x-api-key": ""}

response = requests.delete(url, headers=headers)

print(response.json())
```

```javascript deleteExample
const url = 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c';
const options = {method: 'DELETE', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go deleteExample
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c"

	req, _ := http.NewRequest("DELETE", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby deleteExample
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Delete.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java deleteExample
HttpResponse response = Unirest.delete("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c")
  .header("x-api-key", "")
  .asString();
```

```php deleteExample
request('DELETE', 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp deleteExample
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c");
var request = new RestRequest(Method.DELETE);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift deleteExample
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "DELETE"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X DELETE https://api.twelvelabs.io/v1.3/indexes/:index-id \
     -H "x-api-key: "
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id"

headers = {"x-api-key": ""}

response = requests.delete(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id';
const options = {method: 'DELETE', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id"

	req, _ := http.NewRequest("DELETE", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Delete.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.delete("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id")
  .header("x-api-key", "")
  .asString();
```

```php
request('DELETE', 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id");
var request = new RestRequest(Method.DELETE);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "DELETE"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Upload videos

A video indexing task represents a request to upload and index a video, and you can use this endpoint to manage your tasks.


  When using this endpoint, you can set up webhooks to receive notifications. For details, see the [Webhooks](/v1.3/docs/advanced/webhooks/manage) section.


**Related guides**:

* [Search > Upload videos](/v1.3/docs/guides/search#upload-videos).
* [Generate titles, topics, and hashtags > Upload videos](/v1.3/docs/guides/generate-text-from-video/titles-topics-and-hashtags#upload-videos)
* [Generate summaries, chapters, and highlights > Upload videos](/v1.3/docs/guides/generate-text-from-video/summaries-chapters-and-highlights#upload-videos)
* [Generate open-ended text > Upload videos](/v1.3/docs/guides/generate-text-from-video/open-ended-text#upload-videos)
* [Cloud-to-cloud integrations](/v1.3/docs/advanced/cloud-to-cloud-integrations).


# The task object

A task represents a request to upload and index a video. The `task` object is composed of the following fields:

* `_id`: A string representing the unique identifier of the task. It is assigned by the API service when a new task is created.
* `created_at`: A string indicating the date and time, in the RFC 3339 format, that the task was created.
* `estimated_time`: A string indicating the estimated date and time, in the RFC 3339 format, that the video is ready to be searched.
* `index_id`: A string representing the index to which the video has been uploaded.
* `video_id`: A string representing the unique identifier of the video associated with this video indexing task.
* `system_metadata`: An object that contains the system-generated metadata about the video
* `status`: A string indicating the status of the video indexing task. It can take one of the following values:
  * **Validating**: Your video has finished uploading, and the API service is validating it by ensuring it meets the requirements listed on the [Create a video indexing task](/v1.3/api-reference/tasks/create) page.
  * **Pending**: The platform is spawning a new worker server to process your video.
  * **Queued**: A worker server has been assigned, and the platform is preparing to begin indexing.
  * **Indexing**: The platform transforms the video you uploaded into embeddings. An embedding is a compressed version of the video and contains all the information that TwelveLabs' deep-learning models need to perform downstream tasks.
  * **Ready**: The platform has finished indexing your video.
  * **Failed**: If an error occurs, the status is set to `Failed`.
* `hls`: The platform returns this object only for the videos that you uploaded with the `enable_video_stream` parameter set to `true`. This object has the following fields:
  * `video_url`: A string representing the URL of the video. You can use this URL to access the stream over the HLS protocol.
  * `thumbnail_urls`: An array containing the URL of the thumbnail.
  * `status`: A string representing the encoding status of the video file from its original format to a streamable format.
  * `updated_at`: A string indicating the date and time, in the RFC 3339 format, that the encoding status was last updated.
* `updated_at`: A string indicating the date and time, in the RFC 3339 format, that the task object was last updated. The API service updates this field every time the video indexing task transitions to a different state.


# Create a video indexing task

```http
POST https://api.twelvelabs.io/v1.3/tasks
Content-Type: multipart/form-data
```

This method creates a video indexing task that uploads and indexes a video.

Upload options:
- **Local file**: Use the `video_file` parameter.
- **Publicly accessible URL**: Use the `video_url` parameter.


  The videos you wish to upload must meet the following requirements:
  - **Video resolution**: Must be at least 360x360 and must not exceed 3840x2160.
  - **Aspect ratio**: Must be one of 1:1, 4:3, 4:5, 5:4, 16:9, or 9:16.
  - **Video and audio formats**: Your video files must be encoded in the video and audio formats listed on the [FFmpeg Formats Documentation](https://ffmpeg.org/ffmpeg-formats.html) page. For videos in other formats, contact us at support@twelvelabs.io.
  - **Duration**: For Marengo, it must be between 4 seconds and 2 hours (7,200s). For Pegasus, it must be between 4 seconds and 60 minutes (3600s). In a future release, the maximum duration for Pegasus will be 2 hours (7,200 seconds).
  - **File size**: Must not exceed 2 GB.
    If you require different options, contact us at support@twelvelabs.io.
  
  If both Marengo and Pegasus are enabled for your index, the most restrictive prerequisites will apply.



- The platform supports video URLs that can play without additional user interaction or custom video players. Ensure your URL points to the raw video file, not a web page containing the video. Links to third-party hosting sites, cloud storage services, or videos requiring extra steps to play are not supported.
- This endpoint is rate-limited. For details, see the [Rate limits](/v1.3/docs/get-started/rate-limits) page.





## Response Body

- 200: A video indexing task has successfully been created.
- 400: The request has failed.

## Examples

```shell tasks_create_example
curl -X POST https://api.twelvelabs.io/v1.3/tasks \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F index_id="6298d673f1090f1100476d4c" \
     -F video_file=@@/Users/john/Documents/01.mp4
```

```python tasks_create_example
import requests

url = "https://api.twelvelabs.io/v1.3/tasks"

files = { "video_file": "open('@/Users/john/Documents/01.mp4', 'rb')" }
payload = { "index_id": "6298d673f1090f1100476d4c" }
headers = {"x-api-key": ""}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.json())
```

```javascript tasks_create_example
const url = 'https://api.twelvelabs.io/v1.3/tasks';
const form = new FormData();
form.append('index_id', '6298d673f1090f1100476d4c');
form.append('video_file', '@/Users/john/Documents/01.mp4');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go tasks_create_example
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\n6298d673f1090f1100476d4c\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_file\"; filename=\"01.mp4\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby tasks_create_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\n6298d673f1090f1100476d4c\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_file\"; filename=\"01.mp4\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java tasks_create_example
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/tasks")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\n6298d673f1090f1100476d4c\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_file\"; filename=\"01.mp4\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php tasks_create_example
request('POST', 'https://api.twelvelabs.io/v1.3/tasks', [
  'multipart' => [
    [
        'name' => 'index_id',
        'contents' => '6298d673f1090f1100476d4c'
    ],
    [
        'name' => 'video_file',
        'filename' => '@/Users/john/Documents/01.mp4',
        'contents' => null
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp tasks_create_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\n6298d673f1090f1100476d4c\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_file\"; filename=\"01.mp4\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift tasks_create_example
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "index_id",
    "value": "6298d673f1090f1100476d4c"
  ],
  [
    "name": "video_file",
    "fileName": "@/Users/john/Documents/01.mp4"
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/tasks \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F index_id="string"
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/tasks"

payload = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n"
headers = {
    "x-api-key": "",
    "Content-Type": "multipart/form-data; boundary=---011000010111000001101001"
}

response = requests.post(url, data=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/tasks';
const form = new FormData();
form.append('index_id', 'string');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/tasks")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/tasks', [
  'multipart' => [
    [
        'name' => 'index_id',
        'contents' => 'string'
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "index_id",
    "value": "string"
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# List video indexing tasks

```http
GET https://api.twelvelabs.io/v1.3/tasks
```

This method returns a list of the video indexing tasks in your account. The API returns your video indexing tasks sorted by creation date, with the newest at the top of the list.



## Query Parameters

- Page (optional): A number that identifies the page to retrieve.

**Default**: `1`.

- PageLimit (optional): The number of items to return on each page.

**Default**: `10`.
**Max**: `50`.

- SortBy (optional): The field to sort on. The following options are available:
- `updated_at`: Sorts by the time, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"), when the item was updated.
- `created_at`: Sorts by the time, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"), when the item was created.

**Default**: `created_at`.

- SortOption (optional): The sorting direction. The following options are available:
- `asc`
- `desc`

**Default**: `desc`.

- IndexId (optional): Filter by the unique identifier of an index.

- Status (optional): Filter by one or more video indexing task statuses. The following options are available:
- `ready`: The video has been successfully uploaded and indexed.
- `uploading`: The video is being uploaded.
- `validating`: The video is being validated against the prerequisites.
- `pending`: The video is pending.
- `queued`: The video is queued.
- `indexing`: The video is being indexed.
- `failed`: The video indexing task failed.

To filter by multiple statuses, specify the `status` parameter for each value:
```
status=ready&status=validating
```

- Filename (optional): Filter by filename.

- Duration (optional): Filter by duration. Expressed in seconds.

- Width (optional): Filter by width.

- Height (optional): Filter by height.

- CreatedAt (optional): Filter video indexing tasks by the creation date and time, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"). The platform returns the video indexing tasks that were created on the specified date at or after the given time.

- UpdatedAt (optional): Filter video indexing tasks by the last update date and time, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"). The platform returns the video indexing tasks that were updated on the specified date at or after the given time.


## Response Body

- 200: The video indexing tasks have successfully been retrieved.
- 400: The request has failed.

## Examples

```shell tasks_list_example
curl https://api.twelvelabs.io/v1.3/tasks \
     -H "x-api-key: "
```

```python tasks_list_example
import requests

url = "https://api.twelvelabs.io/v1.3/tasks"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript tasks_list_example
const url = 'https://api.twelvelabs.io/v1.3/tasks';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go tasks_list_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby tasks_list_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java tasks_list_example
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/tasks")
  .header("x-api-key", "")
  .asString();
```

```php tasks_list_example
request('GET', 'https://api.twelvelabs.io/v1.3/tasks', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp tasks_list_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift tasks_list_example
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -G https://api.twelvelabs.io/v1.3/tasks \
     -H "x-api-key: " \
     -d page=0 \
     -d page_limit=0
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/tasks"

querystring = {"page":"0","page_limit":"0"}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/tasks?page=0&page_limit=0';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks?page=0&page_limit=0"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks?page=0&page_limit=0")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/tasks?page=0&page_limit=0")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/tasks?page=0&page_limit=0', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks?page=0&page_limit=0");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks?page=0&page_limit=0")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Retrieve a video indexing task

```http
GET https://api.twelvelabs.io/v1.3/tasks/{task_id}
```

This method retrieves a video indexing task.



## Path Parameters

- TaskId (required): The unique identifier of the video indexing task to retrieve.


## Response Body

- 200: The specified video indexing task has successfully been retrieved.
- 400: The request has failed.

## Examples

```shell tasks_retrieve_example
curl https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c \
     -H "x-api-key: "
```

```python tasks_retrieve_example
import requests

url = "https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript tasks_retrieve_example
const url = 'https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go tasks_retrieve_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby tasks_retrieve_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java tasks_retrieve_example
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c")
  .header("x-api-key", "")
  .asString();
```

```php tasks_retrieve_example
request('GET', 'https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp tasks_retrieve_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift tasks_retrieve_example
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl https://api.twelvelabs.io/v1.3/tasks/:task_id \
     -H "x-api-key: "
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/tasks/%3Atask_id"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/tasks/%3Atask_id';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks/%3Atask_id"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks/%3Atask_id")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/tasks/%3Atask_id")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/tasks/%3Atask_id', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks/%3Atask_id");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks/%3Atask_id")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Delete a video indexing task

```http
DELETE https://api.twelvelabs.io/v1.3/tasks/{task_id}
```

This action cannot be undone.
Note the following about deleting a video indexing task:
- You can only delete video indexing tasks for which the status is `ready` or `failed`.
- If the status of your video indexing task is `ready`, you must first delete the video vector associated with your video indexing task by calling the [`DELETE`](/v1.3/api-reference/videos/delete) method of the `/indexes/videos` endpoint.




## Path Parameters

- TaskId (required): The unique identifier of the video indexing task you want to delete.


## Response Body


- 400: The request has failed.

## Examples

```shell deleteExample
curl -X DELETE https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c \
     -H "x-api-key: "
```

```python deleteExample
import requests

url = "https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c"

headers = {"x-api-key": ""}

response = requests.delete(url, headers=headers)

print(response.json())
```

```javascript deleteExample
const url = 'https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c';
const options = {method: 'DELETE', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go deleteExample
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c"

	req, _ := http.NewRequest("DELETE", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby deleteExample
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Delete.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java deleteExample
HttpResponse response = Unirest.delete("https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c")
  .header("x-api-key", "")
  .asString();
```

```php deleteExample
request('DELETE', 'https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp deleteExample
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c");
var request = new RestRequest(Method.DELETE);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift deleteExample
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks/6298d673f1090f1100476d4c")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "DELETE"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X DELETE https://api.twelvelabs.io/v1.3/tasks/:task_id \
     -H "x-api-key: "
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/tasks/%3Atask_id"

headers = {"x-api-key": ""}

response = requests.delete(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/tasks/%3Atask_id';
const options = {method: 'DELETE', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks/%3Atask_id"

	req, _ := http.NewRequest("DELETE", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks/%3Atask_id")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Delete.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.delete("https://api.twelvelabs.io/v1.3/tasks/%3Atask_id")
  .header("x-api-key", "")
  .asString();
```

```php
request('DELETE', 'https://api.twelvelabs.io/v1.3/tasks/%3Atask_id', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks/%3Atask_id");
var request = new RestRequest(Method.DELETE);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks/%3Atask_id")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "DELETE"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Import videos

```http
POST https://api.twelvelabs.io/v1.3/tasks/transfers/import/{integration-id}
Content-Type: application/json
```

An import represents the process of uploading and indexing all videos from the specified integration.

This method initiates an asynchronous import and returns two lists:
- Videos that will be imported.
- Videos that will not be imported, typically because they do not meet the prerequisites of all enabled video understanding models for your index. Note that the most restrictive prerequisites among the enabled models will apply.

The actual uploading and indexing of videos occur asynchronously after you invoke this method. To monitor the status of each upload after invoking this method, use the [Retrieve import status](/v1.3/api-reference/tasks/cloud-to-cloud-integrations/get-status) method.


  The videos you wish to upload must meet the following requirements:
  - **Video resolution**: Must be at least 360x360 and must not exceed 3840x2160.
  - **Aspect ratio**: Must be one of 1:1, 4:3, 4:5, 5:4, 16:9, or 9:16.
  - **Video and audio formats**: Your video files must be encoded in the video and audio formats listed on the [FFmpeg Formats Documentation](https://ffmpeg.org/ffmpeg-formats.html) page. For videos in other formats, contact us at support@twelvelabs.io.
  - **Duration**: For Marengo, it must be between 4 seconds and 2 hours (7,200s). For Pegasus, it must be between 4 seconds and 60 minutes (3600s). In a future release, the maximum duration for Pegasus will be 2 hours (7,200 seconds).
  - **File size**: Must not exceed 2 GB.
    If you require different options, contact us at support@twelvelabs.io.

  If both Marengo and Pegasus are enabled for your index, the most restrictive prerequisites will apply.



- Before importing videos, you must set up an integration. For details, see the [Set up an integration](/v1.3/docs/advanced/cloud-to-cloud-integrations#set-up-an-integration) section.
- By default, the platform checks for duplicate files using hashes within the target index and will not upload the same video to the same index twice. However, the same video can exist in multiple indexes. To bypass duplicate checking entirely and import duplicate videos into the same index, set the value of the `incremental_import` parameter to `false`.
- Only one import job can run at a time. To start a new import, wait for the current job to complete. Use the [`GET`](/v1.3/api-reference/tasks/cloud-to-cloud-integrations/get-status) method of the `/tasks/transfers/import/{integration-id}/logs` endpoint to retrieve a list of your import jobs, including their creation time, completion time, and processing status for each video file.





## Path Parameters

- Integration-Id (required): The unique identifier of the integration for which you want to import videos. You can retrieve it from the [Integrations](https://playground.twelvelabs.io/dashboard/integrations) page.

## Response Body

- 201: An import has successfully been initiated.

- 400: The request has failed.

## Examples

```shell tasks_transfers_create_example
curl -X POST https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "index_id": "6298d673f1090f1100476d4c",
  "incremental_import": true,
  "retry_failed": false,
  "user_metadata": {
    "category": "recentlyAdded",
    "batchNumber": 5
  }
}'
```

```python tasks_transfers_create_example
import requests

url = "https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c"

payload = {
    "index_id": "6298d673f1090f1100476d4c",
    "incremental_import": True,
    "retry_failed": False
}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript tasks_transfers_create_example
const url = 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"index_id":"6298d673f1090f1100476d4c","incremental_import":true,"retry_failed":false}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go tasks_transfers_create_example
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c"

	payload := strings.NewReader("{\n  \"index_id\": \"6298d673f1090f1100476d4c\",\n  \"incremental_import\": true,\n  \"retry_failed\": false\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby tasks_transfers_create_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"index_id\": \"6298d673f1090f1100476d4c\",\n  \"incremental_import\": true,\n  \"retry_failed\": false\n}"

response = http.request(request)
puts response.read_body
```

```java tasks_transfers_create_example
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"index_id\": \"6298d673f1090f1100476d4c\",\n  \"incremental_import\": true,\n  \"retry_failed\": false\n}")
  .asString();
```

```php tasks_transfers_create_example
request('POST', 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c', [
  'body' => '{
  "index_id": "6298d673f1090f1100476d4c",
  "incremental_import": true,
  "retry_failed": false
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp tasks_transfers_create_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"index_id\": \"6298d673f1090f1100476d4c\",\n  \"incremental_import\": true,\n  \"retry_failed\": false\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift tasks_transfers_create_example
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [
  "index_id": "6298d673f1090f1100476d4c",
  "incremental_import": true,
  "retry_failed": false
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/tasks/transfers/import/:integration-id \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "index_id": "string"
}'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id"

payload = { "index_id": "string" }
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"index_id":"string"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id"

	payload := strings.NewReader("{\n  \"index_id\": \"string\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"index_id\": \"string\"\n}"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"index_id\": \"string\"\n}")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id', [
  'body' => '{
  "index_id": "string"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"index_id\": \"string\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = ["index_id": "string"] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Retrieve import status

```http
GET https://api.twelvelabs.io/v1.3/tasks/transfers/import/{integration-id}/status
```

This method retrieves the current status for each video from a specified integration and index. It returns an object containing lists of videos grouped by status. See the [Upload single videosTask object](/v1.3/api-reference/tasks/the-task-object) page for details on each status.



## Path Parameters

- Integration-Id (required): The unique identifier of the integration for which you want to retrieve the status of your imported videos. You can retrieve it from the [Integrations](https://playground.twelvelabs.io/dashboard/integrations) page.

## Query Parameters

- IndexId (required): The unique identifier of the index for which you want to retrieve the status of your imported videos.


## Response Body

- 200: The status for each video from the specified integration and index has successfully been retrieved

- 400: The request has failed.

## Examples

```shell tasks_transfers_getStatus_example
curl -G https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/status \
     -H "x-api-key: " \
     -d index_id=6298d673f1090f1100476d4c
```

```python tasks_transfers_getStatus_example
import requests

url = "https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/status"

querystring = {"index_id":"6298d673f1090f1100476d4c"}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript tasks_transfers_getStatus_example
const url = 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/status?index_id=6298d673f1090f1100476d4c';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go tasks_transfers_getStatus_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/status?index_id=6298d673f1090f1100476d4c"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby tasks_transfers_getStatus_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/status?index_id=6298d673f1090f1100476d4c")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java tasks_transfers_getStatus_example
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/status?index_id=6298d673f1090f1100476d4c")
  .header("x-api-key", "")
  .asString();
```

```php tasks_transfers_getStatus_example
request('GET', 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/status?index_id=6298d673f1090f1100476d4c', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp tasks_transfers_getStatus_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/status?index_id=6298d673f1090f1100476d4c");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift tasks_transfers_getStatus_example
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/status?index_id=6298d673f1090f1100476d4c")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -G https://api.twelvelabs.io/v1.3/tasks/transfers/import/:integration-id/status \
     -H "x-api-key: " \
     -d index_id=string
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/status"

querystring = {"index_id":"string"}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/status?index_id=string';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/status?index_id=string"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/status?index_id=string")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/status?index_id=string")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/status?index_id=string', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/status?index_id=string");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/status?index_id=string")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Retrieve import logs

```http
GET https://api.twelvelabs.io/v1.3/tasks/transfers/import/{integration-id}/logs
```

This endpoint returns a chronological list of import operations for the specified integration. The list is sorted by creation date, with the oldest imports first. Each item in the list contains:
- The number of videos in each status
- Detailed error information for failed uploads, including filenames and error messages.

Use this endpoint to track import progress and troubleshoot potential issues across multiple operations.




## Path Parameters

- Integration-Id (required): The unique identifier of the integration for which you want to retrieve the import logs. You can retrieve it from the [Integrations](https://playground.twelvelabs.io/dashboard/integrations) page.

## Response Body

- 200: The import logs have successfully been retrieved.
- 400: The request has failed.

## Examples

```shell getLogsExample
curl https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/logs \
     -H "x-api-key: "
```

```python getLogsExample
import requests

url = "https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/logs"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript getLogsExample
const url = 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/logs';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go getLogsExample
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/logs"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby getLogsExample
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/logs")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java getLogsExample
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/logs")
  .header("x-api-key", "")
  .asString();
```

```php getLogsExample
request('GET', 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/logs', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp getLogsExample
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/logs");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift getLogsExample
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks/transfers/import/6298d673f1090f1100476d4c/logs")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl https://api.twelvelabs.io/v1.3/tasks/transfers/import/:integration-id/logs \
     -H "x-api-key: "
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/logs"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/logs';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/logs"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/logs")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/logs")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/logs', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/logs");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/tasks/transfers/import/%3Aintegration-id/logs")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Manage videos

Use this endpoint to manage videos you've uploaded to the platform and retrieve information from them.


# The video object

The `video` object has the following fields:

* `_id`: A string representing the unique identifier of a video. The platform creates a new video object and assigns it a unique identifier when the video has been indexed. Note that video IDs are different from task IDs.
* `created_at`: A string indicating the date and time, in the RFC 3339 format, that the video indexing task was created.
* `indexed_at`: A string indicating the date and time, in the RFC 3339 format, that the video has finished indexing.
* `system_metadata`: An object that contains system-generated metadata about the video. It contains the following fields:
  * `duration`
  * `filename`
  * `fps`
  * `height`
  * `model_names`
  * `size`
  * `video_title`
  * `width`
* `user_metadata`: Any custom metadata you've specified by calling the [`PUT`](/v1.3/api-reference/videos/update)  method of the `/indexes/:index-id/videos/:video-id` endpoint.
* `hls`: The platform returns this object only for the videos that you uploaded with the `enable_video_stream` parameter set to `true`. This object has the following fields:
  * `video_url`: A string representing the URL of the video. You can use this URL to access the stream over the HLS protocol.
  * `thumbnail_urls`: An array containing the URL of the thumbnail.
  * `status`: A string representing the encoding status of the video file from its original format to a streamable format.
  * `updated_at`: A string indicating the date and time, in the RFC 3339 format, that the encoding status was last updated.
* `updated_at`: A string indicating the date and time, in the RFC 3339 format, that the video indexing task object was last updated. The platform updates this field every time the video indexing task transitions to a different state.


# List videos

```http
GET https://api.twelvelabs.io/v1.3/indexes/{index-id}/videos
```

This method returns a list of the videos in the specified index. By default, the API returns your videos sorted by creation date, with the newest at the top of the list.




## Path Parameters

- Index-Id (required): The unique identifier of the index for which the API will retrieve the videos.

## Query Parameters

- Page (optional): A number that identifies the page to retrieve.

**Default**: `1`.

- PageLimit (optional): The number of items to return on each page.

**Default**: `10`.
**Max**: `50`.

- SortBy (optional): The field to sort on. The following options are available:
- `updated_at`: Sorts by the time, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"), when the item was updated.
- `created_at`: Sorts by the time, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"), when the item was created.

**Default**: `created_at`.

- SortOption (optional): The sorting direction. The following options are available:
- `asc`
- `desc`

**Default**: `desc`.

- Filename (optional): Filter by filename.

- Duration (optional): Filter by duration. Expressed in seconds.

- Fps (optional): Filter by frames per second.

- Width (optional): Filter by width.

- Height (optional): Filter by height.

- Size (optional): Filter by size. Expressed in bytes.

- CreatedAt (optional): Filter videos by the creation date and time of their associated indexing tasks, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"). The platform returns the videos whose indexing tasks were created on the specified date at or after the given time.

- UpdatedAt (optional): This filter applies only to videos updated using the [`PUT`](/v1.3/api-reference/videos/update) method of the `/indexes/{index-id}/videos/{video-id}` endpoint. It filters videos by the last update date and time, in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ"). The platform returns the video indexing tasks that were last updated on the specified date at or after the given time.

- UserMetadata (optional): To enable filtering by custom fields, you must first add user-defined metadata to your video by calling the [`PUT`](/v1.3/api-reference/videos/update) method of the `/indexes/:index-id/videos/:video-id` endpoint.

Examples:
- To filter on a string: `?category=recentlyAdded`
- To filter on an integer: `?batchNumber=5`
- To filter on a float: `?rating=9.3`
- To filter on a boolean: `?needsReview=true`


## Response Body

- 200: The video vectors in the specified index have successfully been retrieved.
- 400: The request has failed.

## Examples

```shell listExample
curl -G https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos \
     -H "x-api-key: " \
     -d filename=01.mp4 \
     -d duration=10 \
     -d fps=25 \
     -d width=1920 \
     -d height=1080 \
     -d size=1048576 \
     --data-urlencode created_at=2024-08-16T16:53:59Z \
     --data-urlencode updated_at=2024-08-16T16:53:59Z
```

```python listExample
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos"

querystring = {"filename":"01.mp4","duration":"10","fps":"25","width":"1920","height":"1080","size":"1048576","created_at":"2024-08-16T16:53:59Z","updated_at":"2024-08-16T16:53:59Z","user_metadata":""}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript listExample
const url = 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos?filename=01.mp4&duration=10&fps=25&width=1920&height=1080&size=1048576&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A53%3A59Z&user_metadata=';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go listExample
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos?filename=01.mp4&duration=10&fps=25&width=1920&height=1080&size=1048576&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A53%3A59Z&user_metadata="

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby listExample
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos?filename=01.mp4&duration=10&fps=25&width=1920&height=1080&size=1048576&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A53%3A59Z&user_metadata=")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java listExample
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos?filename=01.mp4&duration=10&fps=25&width=1920&height=1080&size=1048576&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A53%3A59Z&user_metadata=")
  .header("x-api-key", "")
  .asString();
```

```php listExample
request('GET', 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos?filename=01.mp4&duration=10&fps=25&width=1920&height=1080&size=1048576&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A53%3A59Z&user_metadata=', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp listExample
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos?filename=01.mp4&duration=10&fps=25&width=1920&height=1080&size=1048576&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A53%3A59Z&user_metadata=");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift listExample
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos?filename=01.mp4&duration=10&fps=25&width=1920&height=1080&size=1048576&created_at=2024-08-16T16%3A53%3A59Z&updated_at=2024-08-16T16%3A53%3A59Z&user_metadata=")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -G https://api.twelvelabs.io/v1.3/indexes/:index-id/videos \
     -H "x-api-key: " \
     -d page=0 \
     -d page_limit=0
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos"

querystring = {"page":"0","page_limit":"0"}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos?page=0&page_limit=0';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos?page=0&page_limit=0"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos?page=0&page_limit=0")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos?page=0&page_limit=0")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos?page=0&page_limit=0', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos?page=0&page_limit=0");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos?page=0&page_limit=0")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Retrieve video information

```http
GET https://api.twelvelabs.io/v1.3/indexes/{index-id}/videos/{video-id}
```

This method retrieves information about the specified video.




## Path Parameters

- Index-Id (required): The unique identifier of the index to which the video has been uploaded.

- Video-Id (required): The unique identifier of the video to retrieve.


## Query Parameters

- EmbeddingOption (optional): Specifies which types of embeddings to retrieve. You can include one or more of the following values:
- `visual-text`:  Returns visual embeddings optimized for text search.
- `audio`: Returns audio embeddings.


To retrieve embeddings for a video, it must be indexed using the Marengo video understanding model version 2.7 or later. For details on enabling this model for an index, see the [Create an index](/reference/create-index) page.

The platform does not return embeddings if you don't provide this parameter.

The values you specify in `embedding_option` must be included in the `model_options` defined when the index was created. For example, if `model_options` is set to `visual,` you cannot set `embedding_option` to `audio` or  both `visual-text` and `audio`.

- Transcription (optional): The parameter indicates whether to retrieve a transcription of the spoken words for the indexed video. Note that the official SDKs will support this feature in a future release.


## Response Body

- 200: The specified video information has successfully been retrieved.
- 400: The request has failed.
- 404: The specified resource does not exist.

## Examples

```shell retrieveExample
curl -G https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c \
     -H "x-api-key: " \
     -d transcription=true
```

```python retrieveExample
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c"

querystring = {"transcription":"true"}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript retrieveExample
const url = 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c?transcription=true';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go retrieveExample
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c?transcription=true"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby retrieveExample
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c?transcription=true")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java retrieveExample
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c?transcription=true")
  .header("x-api-key", "")
  .asString();
```

```php retrieveExample
request('GET', 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c?transcription=true', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp retrieveExample
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c?transcription=true");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift retrieveExample
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c?transcription=true")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -G https://api.twelvelabs.io/v1.3/indexes/:index-id/videos/:video-id \
     -H "x-api-key: " \
     -d embedding_option=visual-text \
     -d transcription=true
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id"

querystring = {"embedding_option":"[\"visual-text\"]","transcription":"true"}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -G https://api.twelvelabs.io/v1.3/indexes/:index-id/videos/:video-id \
     -H "x-api-key: " \
     -d embedding_option=visual-text \
     -d transcription=true
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id"

querystring = {"embedding_option":"[\"visual-text\"]","transcription":"true"}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id?embedding_option=%5B%22visual-text%22%5D&transcription=true")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Update video information

```http
PUT https://api.twelvelabs.io/v1.3/indexes/{index-id}/videos/{video-id}
Content-Type: application/json
```

Use this method to update the metadata of a video such as file name.



## Path Parameters

- Index-Id (required): The unique identifier of the index to which the video has been uploaded.

- Video-Id (required): The unique identifier of the video to update.


## Response Body


- 400: The request has failed.

## Examples

```shell indexesVideosUpdateExample
curl -X PUT https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "user_metadata": {
    "category": "recentlyAdded",
    "batchNumber": 5,
    "rating": 9.3,
    "needsReview": true
  }
}'
```

```python indexesVideosUpdateExample
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c"

payload = {}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.put(url, json=payload, headers=headers)

print(response.json())
```

```javascript indexesVideosUpdateExample
const url = 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c';
const options = {
  method: 'PUT',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go indexesVideosUpdateExample
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c"

	payload := strings.NewReader("{}")

	req, _ := http.NewRequest("PUT", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby indexesVideosUpdateExample
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{}"

response = http.request(request)
puts response.read_body
```

```java indexesVideosUpdateExample
HttpResponse response = Unirest.put("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{}")
  .asString();
```

```php indexesVideosUpdateExample
request('PUT', 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c', [
  'body' => '{}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp indexesVideosUpdateExample
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c");
var request = new RestRequest(Method.PUT);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift indexesVideosUpdateExample
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "PUT"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X PUT https://api.twelvelabs.io/v1.3/indexes/:index-id/videos/:video-id \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{}'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id"

payload = {}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.put(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id';
const options = {
  method: 'PUT',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id"

	payload := strings.NewReader("{}")

	req, _ := http.NewRequest("PUT", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Put.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{}"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.put("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{}")
  .asString();
```

```php
request('PUT', 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id', [
  'body' => '{}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id");
var request = new RestRequest(Method.PUT);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "PUT"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Delete video information

```http
DELETE https://api.twelvelabs.io/v1.3/indexes/{index-id}/videos/{video-id}
```

This method deletes all the information about the specified video This action cannot be undone.




## Path Parameters

- Index-Id (required): The unique identifier of the index to which the video has been uploaded.

- Video-Id (required): The unique identifier of the video to delete.


## Response Body


- 400: The request has failed.

## Examples

```shell deleteExample
curl -X DELETE https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c \
     -H "x-api-key: "
```

```python deleteExample
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c"

headers = {"x-api-key": ""}

response = requests.delete(url, headers=headers)

print(response.json())
```

```javascript deleteExample
const url = 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c';
const options = {method: 'DELETE', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go deleteExample
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c"

	req, _ := http.NewRequest("DELETE", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby deleteExample
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Delete.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java deleteExample
HttpResponse response = Unirest.delete("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c")
  .header("x-api-key", "")
  .asString();
```

```php deleteExample
request('DELETE', 'https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp deleteExample
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c");
var request = new RestRequest(Method.DELETE);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift deleteExample
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/6298d673f1090f1100476d4c/videos/6298d673f1090f1100476d4c")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "DELETE"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X DELETE https://api.twelvelabs.io/v1.3/indexes/:index-id/videos/:video-id \
     -H "x-api-key: "
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id"

headers = {"x-api-key": ""}

response = requests.delete(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id';
const options = {method: 'DELETE', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id"

	req, _ := http.NewRequest("DELETE", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Delete.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.delete("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id")
  .header("x-api-key", "")
  .asString();
```

```php
request('DELETE', 'https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id");
var request = new RestRequest(Method.DELETE);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/indexes/%3Aindex-id/videos/%3Avideo-id")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "DELETE"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Any-to-video search

Use this endpoint to perform any-to-video searches. Currently, the platform supports text and image queries.


  * This endpoint supports pagination and filtering.
  * When you use pagination, you will not be charged for retrieving subsequent pages of results.


**Related guides**:

* [Search](/v1.3/docs/guides/search).

[**Related quickstart notebook**](https://colab.research.google.com/github/twelvelabs-io/twelvelabs-developer-experience/blob/main/quickstarts/TwelveLabs_Quickstart_Search.ipynb)


# Make any-to-video search requests

```http
POST https://api.twelvelabs.io/v1.3/search
Content-Type: multipart/form-data
```

Use this endpoint to search for relevant matches in an index using text or various media queries.

**Text queries**:
- Use the `query_text` parameter to specify your query.

**Media queries**:
- Set the `query_media_type` parameter to the corresponding media type (example: `image`).
- Specify either one of the following parameters:
  - `query_media_url`: Publicly accessible URL of your media file.
  - `query_media_file`: Local media file.
  If both `query_media_url` and `query_media_file` are specified in the same request, `query_media_url` takes precedence.

Your images must meet the following requirements:
  - **Format**: JPEG and PNG.
  - **Dimension**: Must be at least 64 x 64 pixels.
  - **Size**: Must not exceed 5MB.
  - **Object visibility**: Ensure that the objects of interest are visible and occupy at least 50% of the video frame. This helps the platform accurately identify and match the objects.




This endpoint is rate-limited. For details, see the [Rate limits](/v1.3/docs/get-started/rate-limits) page.





## Response Body

- 200: Successfully performed a search request.
- 400: The request has failed.
- 429: If the rate limit is reached, the platform returns an `HTTP 429 - Too many requests` error response. The response body is empty.


## Examples

```shell search_create_example
curl -X POST https://api.twelvelabs.io/v1.3/search \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F query_media_file=@ \
     -F query_text="A man walking a dog" \
     -F index_id="6298d673f1090f1100476d4c" \
     -F search_options='[
  "visual"
]' \
     -F adjust_confidence_level='0.5' \
     -F group_by="clip" \
     -F sort_option="score" \
     -F operator="or" \
     -F page_limit='10' \
     -F filter="{\"id\":[\"66284191ea717fa66a274832\"]}"
```

```python search_create_example
import requests

url = "https://api.twelvelabs.io/v1.3/search"

files = { "query_media_file": "open('', 'rb')" }
payload = {
    "query_text": "A man walking a dog",
    "index_id": "6298d673f1090f1100476d4c",
    "search_options": "[
  \"visual\"
]",
    "adjust_confidence_level": "0.5",
    "group_by": "clip",
    "sort_option": "score",
    "operator": "or",
    "page_limit": "10",
    "filter": "{\"id\":[\"66284191ea717fa66a274832\"]}"
}
headers = {"x-api-key": ""}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.json())
```

```javascript search_create_example
const url = 'https://api.twelvelabs.io/v1.3/search';
const form = new FormData();
form.append('query_media_file', '');
form.append('query_text', 'A man walking a dog');
form.append('index_id', '6298d673f1090f1100476d4c');
form.append('search_options', '[
  "visual"
]');
form.append('adjust_confidence_level', '0.5');
form.append('group_by', 'clip');
form.append('sort_option', 'score');
form.append('operator', 'or');
form.append('page_limit', '10');
form.append('filter', '{"id":["66284191ea717fa66a274832"]}');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go search_create_example
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/search"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"query_media_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"query_text\"\r\n\r\nA man walking a dog\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\n6298d673f1090f1100476d4c\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"adjust_confidence_level\"\r\n\r\n0.5\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"group_by\"\r\n\r\nclip\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"sort_option\"\r\n\r\nscore\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"operator\"\r\n\r\nor\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"page_limit\"\r\n\r\n10\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"filter\"\r\n\r\n{\"id\":[\"66284191ea717fa66a274832\"]}\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby search_create_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/search")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"query_media_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"query_text\"\r\n\r\nA man walking a dog\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\n6298d673f1090f1100476d4c\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"adjust_confidence_level\"\r\n\r\n0.5\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"group_by\"\r\n\r\nclip\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"sort_option\"\r\n\r\nscore\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"operator\"\r\n\r\nor\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"page_limit\"\r\n\r\n10\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"filter\"\r\n\r\n{\"id\":[\"66284191ea717fa66a274832\"]}\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java search_create_example
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/search")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"query_media_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"query_text\"\r\n\r\nA man walking a dog\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\n6298d673f1090f1100476d4c\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"adjust_confidence_level\"\r\n\r\n0.5\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"group_by\"\r\n\r\nclip\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"sort_option\"\r\n\r\nscore\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"operator\"\r\n\r\nor\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"page_limit\"\r\n\r\n10\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"filter\"\r\n\r\n{\"id\":[\"66284191ea717fa66a274832\"]}\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php search_create_example
request('POST', 'https://api.twelvelabs.io/v1.3/search', [
  'multipart' => [
    [
        'name' => 'query_media_file',
        'filename' => '',
        'contents' => null
    ],
    [
        'name' => 'query_text',
        'contents' => 'A man walking a dog'
    ],
    [
        'name' => 'index_id',
        'contents' => '6298d673f1090f1100476d4c'
    ],
    [
        'name' => 'search_options',
        'contents' => '[
  "visual"
]'
    ],
    [
        'name' => 'adjust_confidence_level',
        'contents' => '0.5'
    ],
    [
        'name' => 'group_by',
        'contents' => 'clip'
    ],
    [
        'name' => 'sort_option',
        'contents' => 'score'
    ],
    [
        'name' => 'operator',
        'contents' => 'or'
    ],
    [
        'name' => 'page_limit',
        'contents' => '10'
    ],
    [
        'name' => 'filter',
        'contents' => '{"id":["66284191ea717fa66a274832"]}'
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp search_create_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/search");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"query_media_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"query_text\"\r\n\r\nA man walking a dog\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\n6298d673f1090f1100476d4c\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"adjust_confidence_level\"\r\n\r\n0.5\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"group_by\"\r\n\r\nclip\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"sort_option\"\r\n\r\nscore\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"operator\"\r\n\r\nor\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"page_limit\"\r\n\r\n10\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"filter\"\r\n\r\n{\"id\":[\"66284191ea717fa66a274832\"]}\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift search_create_example
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "query_media_file",
    "fileName": ""
  ],
  [
    "name": "query_text",
    "value": "A man walking a dog"
  ],
  [
    "name": "index_id",
    "value": "6298d673f1090f1100476d4c"
  ],
  [
    "name": "search_options",
    "value": "[
  \"visual\"
]"
  ],
  [
    "name": "adjust_confidence_level",
    "value": "0.5"
  ],
  [
    "name": "group_by",
    "value": "clip"
  ],
  [
    "name": "sort_option",
    "value": "score"
  ],
  [
    "name": "operator",
    "value": "or"
  ],
  [
    "name": "page_limit",
    "value": "10"
  ],
  [
    "name": "filter",
    "value": "{\"id\":[\"66284191ea717fa66a274832\"]}"
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/search")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/search \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F index_id="string" \
     -F search_options='[
  "visual"
]'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/search"

payload = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001--\r\n"
headers = {
    "x-api-key": "",
    "Content-Type": "multipart/form-data; boundary=---011000010111000001101001"
}

response = requests.post(url, data=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/search';
const form = new FormData();
form.append('index_id', 'string');
form.append('search_options', '[
  "visual"
]');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/search"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/search")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/search")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/search', [
  'multipart' => [
    [
        'name' => 'index_id',
        'contents' => 'string'
    ],
    [
        'name' => 'search_options',
        'contents' => '[
  "visual"
]'
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/search");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "index_id",
    "value": "string"
  ],
  [
    "name": "search_options",
    "value": "[
  \"visual\"
]"
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/search")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/search \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F index_id="string" \
     -F search_options='[
  "visual"
]'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/search"

payload = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001--\r\n"
headers = {
    "x-api-key": "",
    "Content-Type": "multipart/form-data; boundary=---011000010111000001101001"
}

response = requests.post(url, data=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/search';
const form = new FormData();
form.append('index_id', 'string');
form.append('search_options', '[
  "visual"
]');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/search"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/search")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/search")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/search', [
  'multipart' => [
    [
        'name' => 'index_id',
        'contents' => 'string'
    ],
    [
        'name' => 'search_options',
        'contents' => '[
  "visual"
]'
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/search");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"index_id\"\r\n\r\nstring\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"search_options\"\r\n\r\n[\n  \"visual\"\n]\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "index_id",
    "value": "string"
  ],
  [
    "name": "search_options",
    "value": "[
  \"visual\"
]"
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/search")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Retrieve a specific page of search results

```http
GET https://api.twelvelabs.io/v1.3/search/{page-token}
```

Use this endpoint to retrieve a specific page of search results.


When you use pagination, you will not be charged for retrieving subsequent pages of results.





## Path Parameters

- Page-Token (required): A token that identifies the page to retrieve.


## Response Body

- 200: Successfully retrieved the specified page of search results.
- 400: The request has failed.

## Examples

```shell retrieveExample
curl https://api.twelvelabs.io/v1.3/search/1234567890 \
     -H "x-api-key: "
```

```python retrieveExample
import requests

url = "https://api.twelvelabs.io/v1.3/search/1234567890"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript retrieveExample
const url = 'https://api.twelvelabs.io/v1.3/search/1234567890';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go retrieveExample
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/search/1234567890"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby retrieveExample
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/search/1234567890")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java retrieveExample
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/search/1234567890")
  .header("x-api-key", "")
  .asString();
```

```php retrieveExample
request('GET', 'https://api.twelvelabs.io/v1.3/search/1234567890', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp retrieveExample
var client = new RestClient("https://api.twelvelabs.io/v1.3/search/1234567890");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift retrieveExample
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/search/1234567890")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl https://api.twelvelabs.io/v1.3/search/:page-token \
     -H "x-api-key: "
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/search/%3Apage-token"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/search/%3Apage-token';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/search/%3Apage-token"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/search/%3Apage-token")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/search/%3Apage-token")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/search/%3Apage-token', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/search/%3Apage-token");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/search/%3Apage-token")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Create video embeddings


  The  2.7 version of the Marengo video understanding model generates embeddings incompatible with v2.6, which will be discontinued. If you are using v2.6 embeddings, regenerate them using v2.7.


To create video embeddings, you must first upload your videos, and the platform must finish processing them. Uploading and processing videos require some time. Consequently, creating embeddings is an asynchronous process comprised of three steps:

1. [Create a video embedding task](/v1.3/api-reference/video-embeddings/create-video-embedding-task)  that uploads and processes a video.
2. [Monitor the status](/v1.3/api-reference/video-embeddings/retrieve-video-embedding-task-status) of your video embedding task.
3. [Retrieve the embeddings](/v1.3/api-reference/video-embeddings/retrieve-video-embeddings).

**Related guide**: [Create video embeddings](/v1.3/docs/guides/create-embeddings/video).

[**Related quickstart notebook**](https://colab.research.google.com/github/twelvelabs-io/twelvelabs-developer-experience/blob/main/quickstarts/TwelveLabs_Quickstart_Embeddings.ipynb)


# The video embedding object

The video embedding object has the following fields:

* `segments`: An array of objects containing the embeddings for each video segment and the associated information. Each object contains the following fields:
  * `start_offset_time`: The start time of the video segment for this embedding. If the embedding scope is video, this field equals 0.
  * `end_offset_time`: The end time of the video segment for this embedding. If the embedding scope is video, this field equals the duration of the video.
  * `embedding_scope`: Indicates the scope of the embeddings. It can take the following values:
    * `video`: The platform has generated an embedding for the entire video.
    * `clip`: The platform generated embeddings for a specific segment.
  * `float`: An array of floating point numbers representing an embedding.  This array has 1024 dimensions, and you can use it with cosine similarity for various downstream tasks.
* `metadata`: An object containing metadata about the video. This object contains the following fields:
  * `input_filename`: The name of the video file. The platform returns this field when you upload a video from your local file system.
  * `input_url`: The URL of the video. The platform returns this field when you upload a video from a publicly accessible URL.
  * `video_clip_length`: The duration for each clip in seconds, as specified by the `video_clip_length` parameter of the [`POST`](/v1.3/api-reference/video-embeddings/create-video-embedding-task) method of the `/embed/task` endpoint. Note that the platform automatically truncates video segments shorter than 2 seconds. For a 31-second video divided into 6-second segments, the final 1-second segment will be truncated. This truncation only applies to the last segment if it does not meet the minimum length requirement of 2 seconds.
  * `video_embedding_scope`:   The scope of the video embedding. It can take one of the following values: `['clip']` or `['clip', 'video]`.
  * `duration`:  The total duration of the video in seconds.


# Create a video embedding task

```http
POST https://api.twelvelabs.io/v1.3/embed/tasks
Content-Type: multipart/form-data
```

This method creates a new video embedding task that uploads a video to the platform and creates one or multiple video embeddings.

Upload options:
- **Local file**: Use the `video_file` parameter
- **Publicly accessible URL**: Use the `video_url` parameter.

Specify at least one option. If both are provided, `video_url` takes precedence.


  The videos you wish to upload must meet the following requirements:
  - **Video resolution**: Must be at least 360x360 and must not exceed 3840x2160.
  - **Aspect ratio**: Must be one of 1:1, 4:3, 4:5, 5:4, 16:9, or 9:16.
  - **Video and audio formats**: Your video files must be encoded in the video and audio formats listed on the [FFmpeg Formats Documentation](https://ffmpeg.org/ffmpeg-formats.html) page. For videos in other formats, contact us at support@twelvelabs.io.
  - **Duration**: Must be between 4 seconds and 2 hours (7,200s).
  - **File size**: Must not exceed 2 GB.
    If you require different options, contact us at support@twelvelabs.io.



- The "Marengo-retrieval-2.7" video understanding model generates embeddings for all modalities in the same latent space. This shared space enables any-to-any searches across different types of content.
- Video embeddings are stored for seven days.
- The platform supports uploading video files that can play without additional user interaction or custom video players. Ensure your URL points to the raw video file, not a web page containing the video. Links to third-party hosting sites, cloud storage services, or videos requiring extra steps to play are not supported.





## Response Body

- 200: A video embedding task has successfully been created.

- 400: The request has failed.

## Examples

```shell Video embedding using clip scope
curl -X POST https://api.twelvelabs.io/v1.3/embed/tasks \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F model_name="Marengo-retrieval-2.7" \
     -F video_file=@/Users/john/Documents/video.mp4 \
     -F video_embedding_scope="clip"
```

```python Video embedding using clip scope
import requests

url = "https://api.twelvelabs.io/v1.3/embed/tasks"

files = { "video_file": "open('/Users/john/Documents/video.mp4', 'rb')" }
payload = {
    "model_name": "Marengo-retrieval-2.7",
    "video_embedding_scope": "clip"
}
headers = {"x-api-key": ""}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.json())
```

```javascript Video embedding using clip scope
const url = 'https://api.twelvelabs.io/v1.3/embed/tasks';
const form = new FormData();
form.append('model_name', 'Marengo-retrieval-2.7');
form.append('video_file', '/Users/john/Documents/video.mp4');
form.append('video_embedding_scope', 'clip');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Video embedding using clip scope
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed/tasks"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_file\"; filename=\"video.mp4\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_embedding_scope\"\r\n\r\nclip\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Video embedding using clip scope
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed/tasks")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_file\"; filename=\"video.mp4\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_embedding_scope\"\r\n\r\nclip\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java Video embedding using clip scope
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/embed/tasks")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_file\"; filename=\"video.mp4\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_embedding_scope\"\r\n\r\nclip\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php Video embedding using clip scope
request('POST', 'https://api.twelvelabs.io/v1.3/embed/tasks', [
  'multipart' => [
    [
        'name' => 'model_name',
        'contents' => 'Marengo-retrieval-2.7'
    ],
    [
        'name' => 'video_file',
        'filename' => '/Users/john/Documents/video.mp4',
        'contents' => null
    ],
    [
        'name' => 'video_embedding_scope',
        'contents' => 'clip'
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp Video embedding using clip scope
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed/tasks");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_file\"; filename=\"video.mp4\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"video_embedding_scope\"\r\n\r\nclip\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Video embedding using clip scope
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "model_name",
    "value": "Marengo-retrieval-2.7"
  ],
  [
    "name": "video_file",
    "fileName": "/Users/john/Documents/video.mp4"
  ],
  [
    "name": "video_embedding_scope",
    "value": "clip"
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed/tasks")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell embed_tasks_create_example
curl -X POST https://api.twelvelabs.io/v1.3/embed/tasks \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data"
```

```python embed_tasks_create_example
import requests

url = "https://api.twelvelabs.io/v1.3/embed/tasks"

payload = "-----011000010111000001101001--\r\n"
headers = {
    "x-api-key": "",
    "Content-Type": "multipart/form-data; boundary=---011000010111000001101001"
}

response = requests.post(url, data=payload, headers=headers)

print(response.json())
```

```javascript embed_tasks_create_example
const url = 'https://api.twelvelabs.io/v1.3/embed/tasks';
const form = new FormData();

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go embed_tasks_create_example
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed/tasks"

	payload := strings.NewReader("-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby embed_tasks_create_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed/tasks")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java embed_tasks_create_example
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/embed/tasks")
  .header("x-api-key", "")
  .body("-----011000010111000001101001--\r\n")
  .asString();
```

```php embed_tasks_create_example
request('POST', 'https://api.twelvelabs.io/v1.3/embed/tasks', [
  'headers' => [
    'Content-Type' => 'multipart/form-data; boundary=---011000010111000001101001',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp embed_tasks_create_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed/tasks");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "multipart/form-data; boundary=---011000010111000001101001");
request.AddParameter("undefined", "-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift embed_tasks_create_example
import Foundation

let headers = ["x-api-key": ""]
let parameters = []

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed/tasks")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/embed/tasks \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F model_name="string"
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/embed/tasks"

payload = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n"
headers = {
    "x-api-key": "",
    "Content-Type": "multipart/form-data; boundary=---011000010111000001101001"
}

response = requests.post(url, data=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/embed/tasks';
const form = new FormData();
form.append('model_name', 'string');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed/tasks"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed/tasks")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/embed/tasks")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/embed/tasks', [
  'multipart' => [
    [
        'name' => 'model_name',
        'contents' => 'string'
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed/tasks");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "model_name",
    "value": "string"
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed/tasks")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# List video embedding tasks

```http
GET https://api.twelvelabs.io/v1.3/embed/tasks
```

This method returns a list of the video embedding tasks in your account. The platform returns your video embedding tasks sorted by creation date, with the newest at the top of the list.


- Video embeddings are stored for seven days
- When you invoke this method without specifying the `started_at` and `ended_at` parameters, the platform returns all the video embedding tasks created within the last seven days.





## Query Parameters

- StartedAt (optional): Retrieve the video embedding tasks that were created after the given date and time, expressed in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ").

- EndedAt (optional): Retrieve the video embedding tasks that were created before the given date and time, expressed in the RFC 3339 format ("YYYY-MM-DDTHH:mm:ssZ").

- Status (optional): Filter video embedding tasks by their current status. Possible values are `processing`, `ready`, or `failed`.
- Page (optional): A number that identifies the page to retrieve.

**Default**: `1`.

- PageLimit (optional): The number of items to return on each page.

**Default**: `10`.
**Max**: `50`.


## Response Body

- 200: A list of video embedding tasks has successfully been retrieved.

- 400: The request has failed.

## Examples

```shell embed_tasks_list_example
curl https://api.twelvelabs.io/v1.3/embed/tasks \
     -H "x-api-key: "
```

```python embed_tasks_list_example
import requests

url = "https://api.twelvelabs.io/v1.3/embed/tasks"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript embed_tasks_list_example
const url = 'https://api.twelvelabs.io/v1.3/embed/tasks';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go embed_tasks_list_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed/tasks"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby embed_tasks_list_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed/tasks")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java embed_tasks_list_example
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/embed/tasks")
  .header("x-api-key", "")
  .asString();
```

```php embed_tasks_list_example
request('GET', 'https://api.twelvelabs.io/v1.3/embed/tasks', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp embed_tasks_list_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed/tasks");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift embed_tasks_list_example
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed/tasks")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -G https://api.twelvelabs.io/v1.3/embed/tasks \
     -H "x-api-key: " \
     -d started_at=string \
     -d ended_at=string
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/embed/tasks"

querystring = {"started_at":"string","ended_at":"string"}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/embed/tasks?started_at=string&ended_at=string';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed/tasks?started_at=string&ended_at=string"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed/tasks?started_at=string&ended_at=string")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/embed/tasks?started_at=string&ended_at=string")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/embed/tasks?started_at=string&ended_at=string', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed/tasks?started_at=string&ended_at=string");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed/tasks?started_at=string&ended_at=string")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Retrieve the status of a video embedding task

```http
GET https://api.twelvelabs.io/v1.3/embed/tasks/{task_id}/status
```

This method retrieves the status of a video embedding task. Check the task status of a video embedding task to determine when you can retrieve the embedding.

A task can have one of the following statuses:
- `processing`: The platform is creating the embeddings.
- `ready`:  Processing is complete. Retrieve the embeddings by invoking the [`GET`](/v1.3/api-reference/video-embeddings/retrieve-video-embeddings) method of the `/embed/tasks/{task_id} endpoint`.
- `failed`: The task could not be completed, and the embeddings haven't been created.




## Path Parameters

- TaskId (required): The unique identifier of your video embedding task.


## Response Body

- 200: The status of your video embedding task has been retrieved.

- 400: The request has failed.

## Examples

```shell embed_tasks_status_example
curl https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6/status \
     -H "x-api-key: "
```

```python embed_tasks_status_example
import requests

url = "https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6/status"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript embed_tasks_status_example
const url = 'https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6/status';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go embed_tasks_status_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6/status"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby embed_tasks_status_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6/status")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java embed_tasks_status_example
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6/status")
  .header("x-api-key", "")
  .asString();
```

```php embed_tasks_status_example
request('GET', 'https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6/status', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp embed_tasks_status_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6/status");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift embed_tasks_status_example
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6/status")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl https://api.twelvelabs.io/v1.3/embed/tasks/:task_id/status \
     -H "x-api-key: "
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id/status"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id/status';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id/status"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id/status")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id/status")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id/status', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id/status");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id/status")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Retrieve video embeddings

```http
GET https://api.twelvelabs.io/v1.3/embed/tasks/{task_id}
```

This method retrieves embeddings for a specific video embedding task. Ensure the task status is `ready` before invoking this method. Refer to the [Retrieve the status of a video embedding tasks](/v1.3/api-reference/video-embeddings/retrieve-video-embedding-task-status) page for instructions on checking the task status.




## Path Parameters

- TaskId (required): The unique identifier of your video embedding task.


## Query Parameters

- EmbeddingOption (optional): Specifies which types of embeddings to retrieve. You can include one or more of the following values:
  - `visual-text`:  Returns visual embeddings optimized for text search.
  - `audio`: Returns audio embeddings.

The platform returns all available embeddings if you don't provide this parameter.


## Response Body

- 200: Video embeddings have successfully been retrieved.

- 400: The request has failed.

## Examples

```shell embed_tasks_retrieve_example
curl https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6 \
     -H "x-api-key: "
```

```python embed_tasks_retrieve_example
import requests

url = "https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6"

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript embed_tasks_retrieve_example
const url = 'https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go embed_tasks_retrieve_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby embed_tasks_retrieve_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java embed_tasks_retrieve_example
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6")
  .header("x-api-key", "")
  .asString();
```

```php embed_tasks_retrieve_example
request('GET', 'https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp embed_tasks_retrieve_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift embed_tasks_retrieve_example
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed/tasks/663da73b31cdd0c1f638a8e6")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -G https://api.twelvelabs.io/v1.3/embed/tasks/:task_id \
     -H "x-api-key: " \
     -d embedding_option=visual-text
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id"

querystring = {"embedding_option":"[\"visual-text\"]"}

headers = {"x-api-key": ""}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id?embedding_option=%5B%22visual-text%22%5D';
const options = {method: 'GET', headers: {'x-api-key': ''}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id?embedding_option=%5B%22visual-text%22%5D"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id?embedding_option=%5B%22visual-text%22%5D")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["x-api-key"] = ''

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.get("https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id?embedding_option=%5B%22visual-text%22%5D")
  .header("x-api-key", "")
  .asString();
```

```php
request('GET', 'https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id?embedding_option=%5B%22visual-text%22%5D', [
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id?embedding_option=%5B%22visual-text%22%5D");
var request = new RestRequest(Method.GET);
request.AddHeader("x-api-key", "");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed/tasks/%3Atask_id?embedding_option=%5B%22visual-text%22%5D")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Create text, image, and audio embeddings


  The  2.7 version of the Marengo video understanding model generates embeddings incompatible with v2.6, which will be discontinued. If you are using v2.6 embeddings, regenerate them using v2.7.


Use this endpoint to create text, image, and audio embeddings.

**Related guides**:

* [Create text embeddings](/v1.3/docs/guides/create-embeddings/text)
* [Crete image embeddings](/v1.3/docs/guides/create-embeddings/image)
* [Create audio embeddings](/v1.3/docs/guides/create-embeddings/audio)


# The embedding object

The embedding object has the following fields:

* `model_name`: A string that represents the name of the [video understanding model](/v1.3/docs/concepts/models) used by the platform to create the embeddings.

* One or more of the following embedding fields, depending on the parameters specified in the request:
  * `text_embedding`
  * `audio_embedding`
  * `image_embedding`\
    Each of these fields is an object containing the following fields, among other information:
    * `segments`: An array of objects that contains the embeddings for each segment and associated information. Each of these objects contains, among other information, an array of floating point numbers named `float` representing an embedding. This array has 1024 dimensions, and you can use it with cosine similarity for various downstream tasks.

The “Marengo-retrieval-2.7” video understanding model generates embeddings for all modalities in the same latent space. This shared space enables any-to-any searches across different types of content.


# Create embeddings for text, image, and audio

```http
POST https://api.twelvelabs.io/v1.3/embed
Content-Type: multipart/form-data
```

This method creates embeddings for text, image, and audio content.

Before you create an embedding, ensure that your image or audio files meet the following prerequisites:
- [Image embeddings](/v1.3/docs/guides/create-embeddings/image)
- [Audio embeddings](/v1.3/docs/guides/create-embeddings/audio)

Parameters for embeddings:
- **Common parameters**:
  - `model_name`: The video understanding model you want to use. Example: "Marengo-retrieval-2.7".
- **Text embeddings**:
  - `text`: Text for which to create an embedding.
- **Image embeddings**:
  Provide one of the following:
  - `image_url`: Publicly accessible URL of your image file.
  - `image_file`:  Local image file.
- **Audio embeddings**:
  Provide one of the following:
  - `audio_url`: Publicly accessible URL of your audio file.
  - `audio_file`: Local audio file.


- The "Marengo-retrieval-2.7" video understanding model generates embeddings for all modalities in the same latent space. This shared space enables any-to-any searches across different types of content.
- You can create multiple types of embeddings in a single API call.
- Audio embeddings combine generic sound and human speech in a single embedding. For videos with transcriptions, you can retrieve transcriptions and then [create text embeddings](/v1.3/api-reference/text-image-audio-embeddings/create-text-image-audio-embeddings) from these transcriptions.





## Response Body

- 200: A text embedding has successfully been created.

- 400: The request has failed.

## Examples

```shell Text embedding
curl -X POST https://api.twelvelabs.io/v1.3/embed \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F model_name="Marengo-retrieval-2.7" \
     -F text="Man with a dog crossing the street" \
     -F image_file=@ \
     -F audio_file=@
```

```python Text embedding
import requests

url = "https://api.twelvelabs.io/v1.3/embed"

files = {
    "image_file": "open('', 'rb')",
    "audio_file": "open('', 'rb')"
}
payload = {
    "model_name": "Marengo-retrieval-2.7",
    "text": "Man with a dog crossing the street"
}
headers = {"x-api-key": ""}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.json())
```

```javascript Text embedding
const url = 'https://api.twelvelabs.io/v1.3/embed';
const form = new FormData();
form.append('model_name', 'Marengo-retrieval-2.7');
form.append('text', 'Man with a dog crossing the street');
form.append('image_file', '');
form.append('audio_file', '');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Text embedding
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\nMan with a dog crossing the street\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Text embedding
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\nMan with a dog crossing the street\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java Text embedding
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/embed")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\nMan with a dog crossing the street\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php Text embedding
request('POST', 'https://api.twelvelabs.io/v1.3/embed', [
  'multipart' => [
    [
        'name' => 'model_name',
        'contents' => 'Marengo-retrieval-2.7'
    ],
    [
        'name' => 'text',
        'contents' => 'Man with a dog crossing the street'
    ],
    [
        'name' => 'image_file',
        'filename' => '',
        'contents' => null
    ],
    [
        'name' => 'audio_file',
        'filename' => '',
        'contents' => null
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp Text embedding
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\nMan with a dog crossing the street\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Text embedding
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "model_name",
    "value": "Marengo-retrieval-2.7"
  ],
  [
    "name": "text",
    "value": "Man with a dog crossing the street"
  ],
  [
    "name": "image_file",
    "fileName": ""
  ],
  [
    "name": "audio_file",
    "fileName": ""
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell Image embedding using URL
curl -X POST https://api.twelvelabs.io/v1.3/embed \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F model_name="Marengo-retrieval-2.7" \
     -F image_url="https://example.com/image.jpg" \
     -F image_file=@ \
     -F audio_file=@
```

```python Image embedding using URL
import requests

url = "https://api.twelvelabs.io/v1.3/embed"

files = {
    "image_file": "open('', 'rb')",
    "audio_file": "open('', 'rb')"
}
payload = {
    "model_name": "Marengo-retrieval-2.7",
    "image_url": "https://example.com/image.jpg"
}
headers = {"x-api-key": ""}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.json())
```

```javascript Image embedding using URL
const url = 'https://api.twelvelabs.io/v1.3/embed';
const form = new FormData();
form.append('model_name', 'Marengo-retrieval-2.7');
form.append('image_url', 'https://example.com/image.jpg');
form.append('image_file', '');
form.append('audio_file', '');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Image embedding using URL
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_url\"\r\n\r\nhttps://example.com/image.jpg\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Image embedding using URL
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_url\"\r\n\r\nhttps://example.com/image.jpg\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java Image embedding using URL
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/embed")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_url\"\r\n\r\nhttps://example.com/image.jpg\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php Image embedding using URL
request('POST', 'https://api.twelvelabs.io/v1.3/embed', [
  'multipart' => [
    [
        'name' => 'model_name',
        'contents' => 'Marengo-retrieval-2.7'
    ],
    [
        'name' => 'image_url',
        'contents' => 'https://example.com/image.jpg'
    ],
    [
        'name' => 'image_file',
        'filename' => '',
        'contents' => null
    ],
    [
        'name' => 'audio_file',
        'filename' => '',
        'contents' => null
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp Image embedding using URL
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_url\"\r\n\r\nhttps://example.com/image.jpg\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Image embedding using URL
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "model_name",
    "value": "Marengo-retrieval-2.7"
  ],
  [
    "name": "image_url",
    "value": "https://example.com/image.jpg"
  ],
  [
    "name": "image_file",
    "fileName": ""
  ],
  [
    "name": "audio_file",
    "fileName": ""
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell Image embedding using local file
curl -X POST https://api.twelvelabs.io/v1.3/embed \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F model_name="Marengo-retrieval-2.7" \
     -F image_file=@/Users/john/Documents/image.jpg \
     -F audio_file=@
```

```python Image embedding using local file
import requests

url = "https://api.twelvelabs.io/v1.3/embed"

files = {
    "image_file": "open('/Users/john/Documents/image.jpg', 'rb')",
    "audio_file": "open('', 'rb')"
}
payload = { "model_name": "Marengo-retrieval-2.7" }
headers = {"x-api-key": ""}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.json())
```

```javascript Image embedding using local file
const url = 'https://api.twelvelabs.io/v1.3/embed';
const form = new FormData();
form.append('model_name', 'Marengo-retrieval-2.7');
form.append('image_file', '/Users/john/Documents/image.jpg');
form.append('audio_file', '');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Image embedding using local file
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"image.jpg\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Image embedding using local file
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"image.jpg\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java Image embedding using local file
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/embed")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"image.jpg\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php Image embedding using local file
request('POST', 'https://api.twelvelabs.io/v1.3/embed', [
  'multipart' => [
    [
        'name' => 'model_name',
        'contents' => 'Marengo-retrieval-2.7'
    ],
    [
        'name' => 'image_file',
        'filename' => '/Users/john/Documents/image.jpg',
        'contents' => null
    ],
    [
        'name' => 'audio_file',
        'filename' => '',
        'contents' => null
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp Image embedding using local file
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"image.jpg\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Image embedding using local file
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "model_name",
    "value": "Marengo-retrieval-2.7"
  ],
  [
    "name": "image_file",
    "fileName": "/Users/john/Documents/image.jpg"
  ],
  [
    "name": "audio_file",
    "fileName": ""
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell Audio embedding using URL
curl -X POST https://api.twelvelabs.io/v1.3/embed \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F model_name="Marengo-retrieval-2.7" \
     -F image_file=@ \
     -F audio_url="https://example.com/audio.mp3" \
     -F audio_file=@
```

```python Audio embedding using URL
import requests

url = "https://api.twelvelabs.io/v1.3/embed"

files = {
    "image_file": "open('', 'rb')",
    "audio_file": "open('', 'rb')"
}
payload = {
    "model_name": "Marengo-retrieval-2.7",
    "audio_url": "https://example.com/audio.mp3"
}
headers = {"x-api-key": ""}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.json())
```

```javascript Audio embedding using URL
const url = 'https://api.twelvelabs.io/v1.3/embed';
const form = new FormData();
form.append('model_name', 'Marengo-retrieval-2.7');
form.append('image_file', '');
form.append('audio_url', 'https://example.com/audio.mp3');
form.append('audio_file', '');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Audio embedding using URL
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_url\"\r\n\r\nhttps://example.com/audio.mp3\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Audio embedding using URL
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_url\"\r\n\r\nhttps://example.com/audio.mp3\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java Audio embedding using URL
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/embed")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_url\"\r\n\r\nhttps://example.com/audio.mp3\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php Audio embedding using URL
request('POST', 'https://api.twelvelabs.io/v1.3/embed', [
  'multipart' => [
    [
        'name' => 'model_name',
        'contents' => 'Marengo-retrieval-2.7'
    ],
    [
        'name' => 'image_file',
        'filename' => '',
        'contents' => null
    ],
    [
        'name' => 'audio_url',
        'contents' => 'https://example.com/audio.mp3'
    ],
    [
        'name' => 'audio_file',
        'filename' => '',
        'contents' => null
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp Audio embedding using URL
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_url\"\r\n\r\nhttps://example.com/audio.mp3\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Audio embedding using URL
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "model_name",
    "value": "Marengo-retrieval-2.7"
  ],
  [
    "name": "image_file",
    "fileName": ""
  ],
  [
    "name": "audio_url",
    "value": "https://example.com/audio.mp3"
  ],
  [
    "name": "audio_file",
    "fileName": ""
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell Audio embedding using local file
curl -X POST https://api.twelvelabs.io/v1.3/embed \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F model_name="Marengo-retrieval-2.7" \
     -F image_file=@ \
     -F audio_file=@/Users/john/Documents/audio.mp3
```

```python Audio embedding using local file
import requests

url = "https://api.twelvelabs.io/v1.3/embed"

files = {
    "image_file": "open('', 'rb')",
    "audio_file": "open('/Users/john/Documents/audio.mp3', 'rb')"
}
payload = { "model_name": "Marengo-retrieval-2.7" }
headers = {"x-api-key": ""}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.json())
```

```javascript Audio embedding using local file
const url = 'https://api.twelvelabs.io/v1.3/embed';
const form = new FormData();
form.append('model_name', 'Marengo-retrieval-2.7');
form.append('image_file', '');
form.append('audio_file', '/Users/john/Documents/audio.mp3');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Audio embedding using local file
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"audio.mp3\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Audio embedding using local file
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"audio.mp3\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java Audio embedding using local file
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/embed")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"audio.mp3\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php Audio embedding using local file
request('POST', 'https://api.twelvelabs.io/v1.3/embed', [
  'multipart' => [
    [
        'name' => 'model_name',
        'contents' => 'Marengo-retrieval-2.7'
    ],
    [
        'name' => 'image_file',
        'filename' => '',
        'contents' => null
    ],
    [
        'name' => 'audio_file',
        'filename' => '/Users/john/Documents/audio.mp3',
        'contents' => null
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp Audio embedding using local file
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"audio.mp3\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Audio embedding using local file
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "model_name",
    "value": "Marengo-retrieval-2.7"
  ],
  [
    "name": "image_file",
    "fileName": ""
  ],
  [
    "name": "audio_file",
    "fileName": "/Users/john/Documents/audio.mp3"
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell Text embedding with truncation
curl -X POST https://api.twelvelabs.io/v1.3/embed \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F model_name="Marengo-retrieval-2.7" \
     -F text="This is a very long text that might exceed the token limit and need truncation" \
     -F text_truncate="start" \
     -F image_file=@ \
     -F audio_file=@
```

```python Text embedding with truncation
import requests

url = "https://api.twelvelabs.io/v1.3/embed"

files = {
    "image_file": "open('', 'rb')",
    "audio_file": "open('', 'rb')"
}
payload = {
    "model_name": "Marengo-retrieval-2.7",
    "text": "This is a very long text that might exceed the token limit and need truncation",
    "text_truncate": "start"
}
headers = {"x-api-key": ""}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.json())
```

```javascript Text embedding with truncation
const url = 'https://api.twelvelabs.io/v1.3/embed';
const form = new FormData();
form.append('model_name', 'Marengo-retrieval-2.7');
form.append('text', 'This is a very long text that might exceed the token limit and need truncation');
form.append('text_truncate', 'start');
form.append('image_file', '');
form.append('audio_file', '');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Text embedding with truncation
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\nThis is a very long text that might exceed the token limit and need truncation\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text_truncate\"\r\n\r\nstart\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Text embedding with truncation
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\nThis is a very long text that might exceed the token limit and need truncation\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text_truncate\"\r\n\r\nstart\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java Text embedding with truncation
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/embed")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\nThis is a very long text that might exceed the token limit and need truncation\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text_truncate\"\r\n\r\nstart\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php Text embedding with truncation
request('POST', 'https://api.twelvelabs.io/v1.3/embed', [
  'multipart' => [
    [
        'name' => 'model_name',
        'contents' => 'Marengo-retrieval-2.7'
    ],
    [
        'name' => 'text',
        'contents' => 'This is a very long text that might exceed the token limit and need truncation'
    ],
    [
        'name' => 'text_truncate',
        'contents' => 'start'
    ],
    [
        'name' => 'image_file',
        'filename' => '',
        'contents' => null
    ],
    [
        'name' => 'audio_file',
        'filename' => '',
        'contents' => null
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp Text embedding with truncation
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nMarengo-retrieval-2.7\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\nThis is a very long text that might exceed the token limit and need truncation\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"text_truncate\"\r\n\r\nstart\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"audio_file\"; filename=\"\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Text embedding with truncation
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "model_name",
    "value": "Marengo-retrieval-2.7"
  ],
  [
    "name": "text",
    "value": "This is a very long text that might exceed the token limit and need truncation"
  ],
  [
    "name": "text_truncate",
    "value": "start"
  ],
  [
    "name": "image_file",
    "fileName": ""
  ],
  [
    "name": "audio_file",
    "fileName": ""
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/embed \
     -H "x-api-key: " \
     -H "Content-Type: multipart/form-data" \
     -F model_name="string"
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/embed"

payload = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n"
headers = {
    "x-api-key": "",
    "Content-Type": "multipart/form-data; boundary=---011000010111000001101001"
}

response = requests.post(url, data=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/embed';
const form = new FormData();
form.append('model_name', 'string');

const options = {method: 'POST', headers: {'x-api-key': ''}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/embed"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/embed")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/embed")
  .header("x-api-key", "")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/embed', [
  'multipart' => [
    [
        'name' => 'model_name',
        'contents' => 'string'
    ]
  ]
  'headers' => [
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/embed");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"model_name\"\r\n\r\nstring\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["x-api-key": ""]
let parameters = [
  [
    "name": "model_name",
    "value": "string"
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/embed")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Generate text from video

The Generate API suite generates texts based on your videos. The Generate API suite offers three distinct endpoints tailored to meet various requirements. Each endpoint has been designed with specific levels of flexibility and customization to accommodate different needs.

* [`/gist`](/v1.3/api-reference/generate-text-from-video/gist): For topics, titles, and hashtags using predefined formats.
* [`/summarize`](/v1.3/api-reference/generate-text-from-video/summarize):  For summaries, chapters, and highlights, allowing customization with a prompt
* [`/generate`](/v1.3/api-reference/generate-text-from-video/open-ended): For open-ended text, requiring clear instructions in the form of a prompt to guide the output.

**Related guide**: [Generate text from video](/v1.3/docs/guides/generate-text-from-video).

[**Related quickstart notebook**](https://colab.research.google.com/github/twelvelabs-io/twelvelabs-developer-experience/blob/main/quickstarts/TwelveLabs_Quickstart_Generate.ipynb)


# Titles, topics, or hashtags

```http
POST https://api.twelvelabs.io/v1.3/gist
Content-Type: application/json
```

This endpoint generates titles, topics, and hashtags for your videos.






## Response Body

- 200: The gist of the specified video has successfully been generated.

- 400: The request has failed.
- 429: If the rate limit is reached, the platform returns an `HTTP 429 - Too many requests` error response. The response body is empty.


## Examples

```shell generateGistExample
curl -X POST https://api.twelvelabs.io/v1.3/gist \
     -H "x-api-key: 
This endpoint is rate-limited. For details, see the [Rate limits](/v1.3/docs/get-started/rate-limits) page.
" \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "6298d673f1090f1100476d4c",
  "types": [
    "title",
    "topic"
  ]
}'
```

```python generateGistExample
import requests

url = "https://api.twelvelabs.io/v1.3/gist"

payload = { "video_id": "6298d673f1090f1100476d4c" }
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript generateGistExample
const url = 'https://api.twelvelabs.io/v1.3/gist';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"6298d673f1090f1100476d4c"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go generateGistExample
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/gist"

	payload := strings.NewReader("{\n  \"video_id\": \"6298d673f1090f1100476d4c\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby generateGistExample
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/gist")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"6298d673f1090f1100476d4c\"\n}"

response = http.request(request)
puts response.read_body
```

```java generateGistExample
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/gist")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"6298d673f1090f1100476d4c\"\n}")
  .asString();
```

```php generateGistExample
request('POST', 'https://api.twelvelabs.io/v1.3/gist', [
  'body' => '{
  "video_id": "6298d673f1090f1100476d4c"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp generateGistExample
var client = new RestClient("https://api.twelvelabs.io/v1.3/gist");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"6298d673f1090f1100476d4c\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift generateGistExample
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = ["video_id": "6298d673f1090f1100476d4c"] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/gist")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/gist \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "string",
  "types": [
    "title"
  ]
}'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/gist"

payload = { "video_id": "string" }
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/gist';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"string"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/gist"

	payload := strings.NewReader("{\n  \"video_id\": \"string\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/gist")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"string\"\n}"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/gist")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"string\"\n}")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/gist', [
  'body' => '{
  "video_id": "string"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/gist");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"string\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = ["video_id": "string"] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/gist")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/gist \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "string",
  "types": [
    "title"
  ]
}'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/gist"

payload = { "video_id": "string" }
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/gist';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"string"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/gist"

	payload := strings.NewReader("{\n  \"video_id\": \"string\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/gist")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"string\"\n}"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/gist")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"string\"\n}")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/gist', [
  'body' => '{
  "video_id": "string"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/gist");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"string\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = ["video_id": "string"] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/gist")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Summaries, chapters, or highlights

```http
POST https://api.twelvelabs.io/v1.3/summarize
Content-Type: application/json
```

This endpoint generates summaries, chapters, or highlights for your videos. Optionally, you can provide a prompt to customize the output.






## Response Body

- 200: The specified video has successfully been summarized.

- 400: The request has failed.
- 429: If the rate limit is reached, the platform returns an `HTTP 429 - Too many requests` error response. The response body is empty.


## Examples

```shell generate_summarize_example
curl -X POST https://api.twelvelabs.io/v1.3/summarize \
     -H "x-api-key: 
This endpoint is rate-limited. For details, see the [Rate limits](/v1.3/docs/get-started/rate-limits) page.
" \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "6298d673f1090f1100476d4c",
  "type": "summary",
  "prompt": "Generate a summary of this video for a social media post, up to two sentences.",
  "temperature": 0.2
}'
```

```python generate_summarize_example
import requests

url = "https://api.twelvelabs.io/v1.3/summarize"

payload = {
    "video_id": "6298d673f1090f1100476d4c",
    "type": "summary",
    "prompt": "Generate a summary of this video for a social media post, up to two sentences.",
    "temperature": 0.2
}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript generate_summarize_example
const url = 'https://api.twelvelabs.io/v1.3/summarize';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"6298d673f1090f1100476d4c","type":"summary","prompt":"Generate a summary of this video for a social media post, up to two sentences.","temperature":0.2}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go generate_summarize_example
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/summarize"

	payload := strings.NewReader("{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"type\": \"summary\",\n  \"prompt\": \"Generate a summary of this video for a social media post, up to two sentences.\",\n  \"temperature\": 0.2\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby generate_summarize_example
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/summarize")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"type\": \"summary\",\n  \"prompt\": \"Generate a summary of this video for a social media post, up to two sentences.\",\n  \"temperature\": 0.2\n}"

response = http.request(request)
puts response.read_body
```

```java generate_summarize_example
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/summarize")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"type\": \"summary\",\n  \"prompt\": \"Generate a summary of this video for a social media post, up to two sentences.\",\n  \"temperature\": 0.2\n}")
  .asString();
```

```php generate_summarize_example
request('POST', 'https://api.twelvelabs.io/v1.3/summarize', [
  'body' => '{
  "video_id": "6298d673f1090f1100476d4c",
  "type": "summary",
  "prompt": "Generate a summary of this video for a social media post, up to two sentences.",
  "temperature": 0.2
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp generate_summarize_example
var client = new RestClient("https://api.twelvelabs.io/v1.3/summarize");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"type\": \"summary\",\n  \"prompt\": \"Generate a summary of this video for a social media post, up to two sentences.\",\n  \"temperature\": 0.2\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift generate_summarize_example
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [
  "video_id": "6298d673f1090f1100476d4c",
  "type": "summary",
  "prompt": "Generate a summary of this video for a social media post, up to two sentences.",
  "temperature": 0.2
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/summarize")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/summarize \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "string",
  "type": "string"
}'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/summarize"

payload = {
    "video_id": "string",
    "type": "string"
}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/summarize';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"string","type":"string"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/summarize"

	payload := strings.NewReader("{\n  \"video_id\": \"string\",\n  \"type\": \"string\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/summarize")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"string\",\n  \"type\": \"string\"\n}"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/summarize")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"string\",\n  \"type\": \"string\"\n}")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/summarize', [
  'body' => '{
  "video_id": "string",
  "type": "string"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/summarize");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"string\",\n  \"type\": \"string\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [
  "video_id": "string",
  "type": "string"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/summarize")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/summarize \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "string",
  "type": "string"
}'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/summarize"

payload = {
    "video_id": "string",
    "type": "string"
}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/summarize';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"string","type":"string"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/summarize"

	payload := strings.NewReader("{\n  \"video_id\": \"string\",\n  \"type\": \"string\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/summarize")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"string\",\n  \"type\": \"string\"\n}"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/summarize")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"string\",\n  \"type\": \"string\"\n}")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/summarize', [
  'body' => '{
  "video_id": "string",
  "type": "string"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/summarize");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"string\",\n  \"type\": \"string\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [
  "video_id": "string",
  "type": "string"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/summarize")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Open-ended texts

```http
POST https://api.twelvelabs.io/v1.3/generate
Content-Type: application/json
```

This endpoint generates open-ended texts based on your videos, including but not limited to tables of content, action items, memos, and detailed analyses.






## Response Body

- 200: The specified video has successfully been processed.
- 400: The request has failed.
- 429: If the rate limit is reached, the platform returns an `HTTP 429 - Too many requests` error response. The response body is empty.


## Examples

```shell Non-streamed response
curl -X POST https://api.twelvelabs.io/v1.3/generate \
     -H "x-api-key: 
- This endpoint is rate-limited. For details, see the [Rate limits](/v1.3/docs/get-started/rate-limits) page.
- This endpoint supports streaming responses. For details on integrating this feature into your application, refer to the [Generate open-ended text](/v1.3/docs/guides/generate-text-from-video/open-ended-text) page.
" \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
}'
```

```python Non-streamed response
import requests

url = "https://api.twelvelabs.io/v1.3/generate"

payload = {
    "video_id": "6298d673f1090f1100476d4c",
    "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
    "temperature": 0.2,
    "stream": True
}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Non-streamed response
const url = 'https://api.twelvelabs.io/v1.3/generate';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"6298d673f1090f1100476d4c","prompt":"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.","temperature":0.2,"stream":true}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Non-streamed response
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/generate"

	payload := strings.NewReader("{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Non-streamed response
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/generate")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}"

response = http.request(request)
puts response.read_body
```

```java Non-streamed response
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/generate")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}")
  .asString();
```

```php Non-streamed response
request('POST', 'https://api.twelvelabs.io/v1.3/generate', [
  'body' => '{
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp Non-streamed response
var client = new RestClient("https://api.twelvelabs.io/v1.3/generate");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Non-streamed response
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/generate")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell Stream start
curl -X POST https://api.twelvelabs.io/v1.3/generate \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
}'
```

```python Stream start
import requests

url = "https://api.twelvelabs.io/v1.3/generate"

payload = {
    "video_id": "6298d673f1090f1100476d4c",
    "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
    "temperature": 0.2,
    "stream": True
}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Stream start
const url = 'https://api.twelvelabs.io/v1.3/generate';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"6298d673f1090f1100476d4c","prompt":"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.","temperature":0.2,"stream":true}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Stream start
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/generate"

	payload := strings.NewReader("{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Stream start
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/generate")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}"

response = http.request(request)
puts response.read_body
```

```java Stream start
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/generate")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}")
  .asString();
```

```php Stream start
request('POST', 'https://api.twelvelabs.io/v1.3/generate', [
  'body' => '{
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp Stream start
var client = new RestClient("https://api.twelvelabs.io/v1.3/generate");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Stream start
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/generate")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell Text generation
curl -X POST https://api.twelvelabs.io/v1.3/generate \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
}'
```

```python Text generation
import requests

url = "https://api.twelvelabs.io/v1.3/generate"

payload = {
    "video_id": "6298d673f1090f1100476d4c",
    "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
    "temperature": 0.2,
    "stream": True
}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Text generation
const url = 'https://api.twelvelabs.io/v1.3/generate';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"6298d673f1090f1100476d4c","prompt":"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.","temperature":0.2,"stream":true}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Text generation
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/generate"

	payload := strings.NewReader("{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Text generation
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/generate")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}"

response = http.request(request)
puts response.read_body
```

```java Text generation
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/generate")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}")
  .asString();
```

```php Text generation
request('POST', 'https://api.twelvelabs.io/v1.3/generate', [
  'body' => '{
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp Text generation
var client = new RestClient("https://api.twelvelabs.io/v1.3/generate");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Text generation
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/generate")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell Stream end
curl -X POST https://api.twelvelabs.io/v1.3/generate \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
}'
```

```python Stream end
import requests

url = "https://api.twelvelabs.io/v1.3/generate"

payload = {
    "video_id": "6298d673f1090f1100476d4c",
    "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
    "temperature": 0.2,
    "stream": True
}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Stream end
const url = 'https://api.twelvelabs.io/v1.3/generate';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"6298d673f1090f1100476d4c","prompt":"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.","temperature":0.2,"stream":true}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Stream end
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/generate"

	payload := strings.NewReader("{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Stream end
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/generate")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}"

response = http.request(request)
puts response.read_body
```

```java Stream end
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/generate")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}")
  .asString();
```

```php Stream end
request('POST', 'https://api.twelvelabs.io/v1.3/generate', [
  'body' => '{
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp Stream end
var client = new RestClient("https://api.twelvelabs.io/v1.3/generate");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"6298d673f1090f1100476d4c\",\n  \"prompt\": \"I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.\",\n  \"temperature\": 0.2,\n  \"stream\": true\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Stream end
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [
  "video_id": "6298d673f1090f1100476d4c",
  "prompt": "I want to generate a description for my video with the following format - Title of the video, followed by a summary in 2-3 sentences, highlighting the main topic, key events, and concluding remarks.",
  "temperature": 0.2,
  "stream": true
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/generate")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/generate \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "string",
  "prompt": "string"
}'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/generate"

payload = {
    "video_id": "string",
    "prompt": "string"
}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/generate';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"string","prompt":"string"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/generate"

	payload := strings.NewReader("{\n  \"video_id\": \"string\",\n  \"prompt\": \"string\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/generate")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"string\",\n  \"prompt\": \"string\"\n}"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/generate")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"string\",\n  \"prompt\": \"string\"\n}")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/generate', [
  'body' => '{
  "video_id": "string",
  "prompt": "string"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/generate");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"string\",\n  \"prompt\": \"string\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [
  "video_id": "string",
  "prompt": "string"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/generate")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

```shell
curl -X POST https://api.twelvelabs.io/v1.3/generate \
     -H "x-api-key: " \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "string",
  "prompt": "string"
}'
```

```python
import requests

url = "https://api.twelvelabs.io/v1.3/generate"

payload = {
    "video_id": "string",
    "prompt": "string"
}
headers = {
    "x-api-key": "",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.twelvelabs.io/v1.3/generate';
const options = {
  method: 'POST',
  headers: {'x-api-key': '', 'Content-Type': 'application/json'},
  body: '{"video_id":"string","prompt":"string"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.twelvelabs.io/v1.3/generate"

	payload := strings.NewReader("{\n  \"video_id\": \"string\",\n  \"prompt\": \"string\"\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("x-api-key", "")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.twelvelabs.io/v1.3/generate")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["x-api-key"] = ''
request["Content-Type"] = 'application/json'
request.body = "{\n  \"video_id\": \"string\",\n  \"prompt\": \"string\"\n}"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse response = Unirest.post("https://api.twelvelabs.io/v1.3/generate")
  .header("x-api-key", "")
  .header("Content-Type", "application/json")
  .body("{\n  \"video_id\": \"string\",\n  \"prompt\": \"string\"\n}")
  .asString();
```

```php
request('POST', 'https://api.twelvelabs.io/v1.3/generate', [
  'body' => '{
  "video_id": "string",
  "prompt": "string"
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'x-api-key' => '',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.twelvelabs.io/v1.3/generate");
var request = new RestRequest(Method.POST);
request.AddHeader("x-api-key", "");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"video_id\": \"string\",\n  \"prompt\": \"string\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "x-api-key": "",
  "Content-Type": "application/json"
]
let parameters = [
  "video_id": "string",
  "prompt": "string"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.twelvelabs.io/v1.3/generate")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

# Error codes

This page lists the most common error messages you may encounter while using the platform.

# General

* `parameter_invalid`
  * The `{parameter}` parameter is invalid.
  * The following parameters are invalid: `{parameters}`.
  * The request contains some invalid parameters.
* `parameter_not_provided`
  * The `{parameter}` parameter is required but was not provided.
  * The following required parameters were not provided: `{parameters}`.
  * Some required parameters are not provided.
* `parameter_unknown`
  * The `{parameter}` parameter is unknown.
  * The following parameters are unknown: `{parameters}`.
  * The request contains some unknown parameters.
* `resource_not_exist`
  * Resource with id `{resource_id}` does not exist in `{collection_name}`.
* `api_key_invalid`
  * API Key is either invalid or expired. Please check your API key or generate a new one from the dashboard and try again.
* `tags_not_allowed`
  * Tag `{tag}` is not allowed to use. Please remove it from the request.
  * The following tags are not allowed to be used: `{tags}`. Please remove these from the request.
* `api_upgrade_required`
  * This endpoint is supported starting with version `{version}`. Your version is `{current_version}`.

# The `/indexes` endpoint

* `index_option_cannot_be_changed`
  * Index option cannot be changed. Please remove index\_options parameter and try again. If you want to change index option, please create new index.
* `index_engine_cannot_be_changed`
  * Index engine cannot be changed. Please remove engine\_id parameter and try again. If you want to change engine, please create new index.
* `index_name_already_exists`
  * Index name `{index_name}` already exists. Please use another unique name and try again.

# The `/tasks` endpoint

* `video_resolution_too_low`
  * The resolution of the video is too low. Please upload a video with resolution between 360x360 and 3840x2160. Current resolution is `{current_resolution}`.
* `video_resolution_too_high`
  * The resolution of the video is too high. Please upload a video with resolution between 360x360 and 3840x2160. Current resolution is `{current_resolution}`.
* `video_resolution_invalid_aspect_ratio`
  * The aspect ratio of the video is invalid. Please upload a video with aspect ratio between 1:1 and 16:9. Current resolution is `{current_resolution}`.
* `video_duration_too_short`
  * Video is too short. Please use video with duration between 10 seconds and 2 hours(7200 seconds). Current duration is `{current_duration}` seconds.
* `video_duration_too_long`
  * Video is too long. Please use video with duration between 10 seconds and 2 hours(7200 seconds). Current duration is `{current_duration}` seconds.
* `video_file_broken`
  * Cannot read video file. Please check the video file is valid and try again.
* `task_cannot_be_deleted`
  * (Returns raw error message)
* `usage_limit_exceeded`
  * Not enough free credit. Please register a payment method or contact [sales@twelvelabs.io](mailto:sales@twelvelabs.io).
* `video_filesize_too_large`
  * The video is too large. Please use a video with a size less than `{maximum_size}`. The current size is `{current_file_size}`.

# The `/search` endpoint

* `search_option_not_supported`
  * Search option `{search_option}` is not supported for index `{index_id}`. Please use one of the following search options: `{supported_search_option}`.
* `search_option_combination_not_supported`
  * Search option `{search_option}` is not supported with `{other_combination}`.
* `search_filter_invalid`
  * Filter used in search is invalid. Please use the valid filter syntax by following filtering documentation.
* `search_page_token_expired`
  * The token that identifies the page to be retrieved is expired or invalid. You must make a new search request. Token: `{next_page_token}`.
* `index_not_supported_for_search`:
  * You can only perform search requests on indexes with an engine from the Marengo family enabled.

# The `/generate` endpoint

* `token_limit_exceeded`
  * Your request could not be processed due to exceeding maximum token limit. Please try with another request or another video with shorter duration.
* `index_not_supported_for_generate`
  * You can only summarize videos uploaded to an index with an engine from the Pegasus family enabled.

# The `/summarize` endpoint

* `token_limit_exceeded`
  * Your request could not be processed due to exceeding maximum token limit. Please try with another request or another video with shorter duration.

# The `/embed` endpoint

* `parameter_invalid`
  * The `text` parameter is invalid. The text token length should be less than or equal to 77.
  * The `text_truncate` parameter is invalid. You should use one of the following values: `none`, `start`, `end`.

# The `/embed/tasks` endpoint

* `parameter_invalid`
  * The `video_clip_length` parameter is invalid. `video_clip_length` should be within 2-10 seconds long
  * The `video_end_offset_sec` parameter is invalid. `video_end_offset_sec` should be greater than `video_start_offset_sec`

# The `/embed/tasks/{task-id}/status` endpoint

* `parameter_invalid`
  * The `task_id` parameter is invalid. `task_id` value is invalid