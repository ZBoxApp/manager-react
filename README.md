# ZBox Manager in REACT

## Configuration

The is a configuration file under `config/config.json` with the following structure

```json
{
    "debug": true,
    "zimbraUrl": "http://zimbra.zboxapp.dev:8000/service/admin/soap",
    "zimbraProxy": "https://zimbra.zboxapp.dev:7071",
    "dnsApiUrl": "http://zimbra.zboxapp.dev:3000",
    "plans": {
        "basic": true,
        "premium": true,
        "professional": true,
        "default": false
    },
    "companiesEndPoints": {
        "list": "http://zimbra.zboxapp.dev:8001/list",
        "detail": "http://zimbra.zboxapp.dev:8001/company/{id}",
        "invoices": "http://zimbra.zboxapp.dev:8001/company/{id}/invoices"
    }
}

```

* **debug**: Use in development environmet to recieve messages in the javascript console.
* **zimbraUrl**: The URL where the zimbra admin services are running.
* **zimbraProxy**: The URL of a proxy server to allow CORS between the webapp and the Zimbra admin service.
* **dnsApiUrl**: URL of the DNS api to get DNS information ( [zDNS](https://github.com/ZBoxApp/zDNS) ).
* **plans**: Object with the available mailboxes plans, set to *true* if enabled or *false* to disable it.
* **companiesEndPoints**: This are the enpoints to get information about companies and invoices. (Checkout the companies endpoint specifications below).
  * **list**: The Endpoint to get a list of available companies
  * **detail**: The Endpoint to get information from a specific company. The *{id}* string paramenter is mandatory.
  * **invoices**: The Endpoint to get information for the invoices of a specific company. The *{id}* string paramenter is mandatory.
  
  
## Companies endpoint specifications

The method of every endpoint should be `GET` (so far no security is being allowed).

### List
REST Service that returns a list of available companies.
  
  * Content-Type: `application/json`
  * Method: `GET`

Response should be a `json array` with the following structure:
```json
[
  {
    "id": "company-identifier",
    "name": "company name"
  }
]
```

### Detail
REST Service that returns the company specified by the {id} parameter.
  
  * Content-Type: `application/json`
  * Method: `GET`

Response should be a `json object` with the following structure:
```json
{
  "id": "company-identifier",
  "name": "company name"
}
```


### Invoices
REST Services that returns the invoices for the company specified by the {id} parameter.

  * Content-Type: `application/json`
  * Method: `GET`
  
Response should be a `json array` with the following structure:
```json
[
  {
    "number": 123,
    "link": "optional url to view the invoice",
    "date": "2016-04-30T19:33:00Z",
    "total": "$ 12.000",
    "status": 0
  }
]
```

Posible status are:

|  Status  | Meaning   |
| -------- | --------- |
|    0     | Pendiente |
|    1     | Pagada    |
|    2     | Vencida   |
|    3     | Anulada   |

## TODO

* Add security to the companies Endpoints
