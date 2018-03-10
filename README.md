# tder
small ASN1 DER and PEM parser in pure js

wow, just 100 lines of code and the module can parse ASN1-DER data structures.
it is made to read informations from certificates. 
tested with certificates generated with hyperledger cryptogen and the github.com certificate

```js
// test.js
var tder = require('./index');
var fs = require('fs');


var asn1 = tder.parsePem(`
-----BEGIN CERTIFICATE-----
MIIHeTCCBmGgAwIBAgIQC/20CQrXteZAwwsWyVKaJzANBgkqhkiG9w0BAQsFADB1
MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3
...
nT8MIG1u1zF8MA0GCSqGSIb3DQEBCwUAA4IBAQCLbNtkxuspqycq8h1EpbmAX0wM
FrBHTFxqIP6kDnxiLElBrZngtY07ietaYZVLQN/ETyqLQftsf8TecwTklbjvm8NT
JqbaIVifYwqwNN+4lRxS3F5lNlA/il12IOgbRioLI62o8G0DaEUQgHNf8vSG
-----END CERTIFICATE-----
`);
asn1 = tder.interpreter.certInterpreter(asn1);
// {
//   "issuer": {
//     "countryName": "US",
//     "organizationName": "DigiCert Inc",
//     "organizationalUnitName": "www.digicert.com",
//     "commonName": "DigiCert SHA2 Extended Validation Server CA"
//   },
//   "dueTime": {},
//   "subject": {
//     "businessCategory": "Private Organization",
//     "jurisdictionCountryName": "US",
//     "jurisdictionStateOrProvinceName": "Delaware",
//     "serialNumber": "5157550",
//     "streetAddress": "88 Colin P Kelly, Jr Street",
//     "postalCode": "94107",
//     "countryName": "US",
//     "stateOrProvinceName": "California",
//     "localityName": "San Francisco",
//     "organizationName": "GitHub, Inc.",
//     "commonName": "github.com"
//   }
// }
```


you can clearly see the issue and subject, to verify if the datastructures are are valid and are signed correctly, 
you need to look elsewhere.