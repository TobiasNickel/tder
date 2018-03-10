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
d3cuZGlnaWNlcnQuY29tMTQwMgYDVQQDEytEaWdpQ2VydCBTSEEyIEV4dGVuZGVk
IFZhbGlkYXRpb24gU2VydmVyIENBMB4XDTE2MDMxMDAwMDAwMFoXDTE4MDUxNzEy
MDAwMFowgf0xHTAbBgNVBA8MFFByaXZhdGUgT3JnYW5pemF0aW9uMRMwEQYLKwYB
BAGCNzwCAQMTAlVTMRkwFwYLKwYBBAGCNzwCAQITCERlbGF3YXJlMRAwDgYDVQQF
Ewc1MTU3NTUwMSQwIgYDVQQJExs4OCBDb2xpbiBQIEtlbGx5LCBKciBTdHJlZXQx
DjAMBgNVBBETBTk0MTA3MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5p
YTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEVMBMGA1UEChMMR2l0SHViLCBJbmMu
MRMwEQYDVQQDEwpnaXRodWIuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA54hc8pZclxgcupjiA/F/OZGRwm/ZlucoQGTNTKmBEgNsrn/mxhngWmPw
bAvUaLP//T79Jc+1WXMpxMiz9PK6yZRRFuIo0d2bx423NA6hOL2RTtbnfs+y0PFS
/YTpQSelTuq+Fuwts5v6aAweNyMcYD0HBybkkdosFoDccBNzJ92Ac8I5EVDUc3Or
/4jSyZwzxu9kdmBlBzeHMvsqdH8SX9mNahXtXxRpwZnBiUjw36PgN+s9GLWGrafd
02T0ux9Yzd5ezkMxukqEAQ7AKIIijvaWPAJbK/52XLhIy2vpGNylyni/DQD18bBP
T+ZG1uv0QQP9LuY/joO+FKDOTler4wIDAQABo4IDejCCA3YwHwYDVR0jBBgwFoAU
PdNQpdagre7zSmAKZdMh1Pj41g8wHQYDVR0OBBYEFIhcSGcZzKB2WS0RecO+oqyH
IidbMCUGA1UdEQQeMByCCmdpdGh1Yi5jb22CDnd3dy5naXRodWIuY29tMA4GA1Ud
DwEB/wQEAwIFoDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwdQYDVR0f
BG4wbDA0oDKgMIYuaHR0cDovL2NybDMuZGlnaWNlcnQuY29tL3NoYTItZXYtc2Vy
dmVyLWcxLmNybDA0oDKgMIYuaHR0cDovL2NybDQuZGlnaWNlcnQuY29tL3NoYTIt
ZXYtc2VydmVyLWcxLmNybDBLBgNVHSAERDBCMDcGCWCGSAGG/WwCATAqMCgGCCsG
AQUFBwIBFhxodHRwczovL3d3dy5kaWdpY2VydC5jb20vQ1BTMAcGBWeBDAEBMIGI
BggrBgEFBQcBAQR8MHowJAYIKwYBBQUHMAGGGGh0dHA6Ly9vY3NwLmRpZ2ljZXJ0
LmNvbTBSBggrBgEFBQcwAoZGaHR0cDovL2NhY2VydHMuZGlnaWNlcnQuY29tL0Rp
Z2lDZXJ0U0hBMkV4dGVuZGVkVmFsaWRhdGlvblNlcnZlckNBLmNydDAMBgNVHRMB
Af8EAjAAMIIBfwYKKwYBBAHWeQIEAgSCAW8EggFrAWkAdgCkuQmQtBhYFIe7E6LM
Z3AKPDWYBPkb37jjd80OyA3cEAAAAVNhieoeAAAEAwBHMEUCIQCHHSEY/ROK2/sO
ljbKaNEcKWz6BxHJNPOtjSyuVnSn4QIgJ6RqvYbSX1vKLeX7vpnOfCAfS2Y8lB5R
NMwk6us2QiAAdgBo9pj4H2SCvjqM7rkoHUz8cVFdZ5PURNEKZ6y7T0/7xAAAAVNh
iennAAAEAwBHMEUCIQDZpd5S+3to8k7lcDeWBhiJASiYTk2rNAT26lVaM3xhWwIg
NUqrkIODZpRg+khhp8ag65B8mu0p4JUAmkRDbiYnRvYAdwBWFAaaL9fC7NP14b1E
sj7HRna5vJkRXMDvlJhV1onQ3QAAAVNhieqZAAAEAwBIMEYCIQDnm3WStlvE99GC
izSx+UGtGmQk2WTokoPgo1hfiv8zIAIhAPrYeXrBgseA9jUWWoB4IvmcZtshjXso
nT8MIG1u1zF8MA0GCSqGSIb3DQEBCwUAA4IBAQCLbNtkxuspqycq8h1EpbmAX0wM
5DoW7hM/FVdz4LJ3Kmftyk1yd8j/PSxRrAQN2Mr/frKeK8NE1cMji32mJbBqpWtK
/+wC+avPplBUbNpzP53cuTMF/QssxItPGNP5/OT9Aj1BxA/NofWZKh4ufV7cz3pY
RDS4BF+EEFQ4l5GY+yp4WJA/xSvYsTHWeWxRD1/nl62/Rd9FN2NkacRVozCxRVle
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

results:
```json github.com
[
  [
    [
      "US",
      "DigiCert Inc",
      "www.digicert.com",
      "DigiCert SHA2 Extended Validation Server CA"
    ],
    [
      "160310000000Z",
      "180517120000Z"
    ],
    [
      "US",
      "Delaware",
      "5157550",
      "88 Colin P Kelly, Jr Street",
      "94107",
      "US",
      "California",
      "San Francisco",
      "GitHub, Inc.",
      "github.com"
    ],
    "\u00000�\u0001\n\u0002�\u0001\u0001\u0000�\\�\\�\u0018\u001c���\u0003�9���oٖ�(@d�L��\u0012\u0003l���\u0019�Zc�l\u000b�h���>�%ϵYs)�ȳ��ɔQ\u0016�(�ݛǍ�4\u000e�8��N��~ϲ��R���A'�N�\u0016�-���h\f\u001e7#\u001c`=\u0007\u0007&��,\u0016��p\u0013s'݀s�9\u0011P�ss����ɜ3��dv`e\u00077�2�*t\u0012_ٍj\u0015�_\u0014i����H�ߣ�7�=\u0018������d�\u001fX��^�C1�J�\u0001\u000e�(�\"���<\u0002[+�v\\�H�k�\u0018ܥ�x�\r\u0000��OO�F���A\u0003�.�?���\u0014��NW��\u0002\u0003\u0001\u0000\u0001",
    [
      "�",
      "�"
    ]
  ],
  "\u0000�l�d��)�'*�\u001dD���_L\f�:\u0016�\u0013?\u0015Ws�w*g��Mrw��=,Q�\u0004\r���~��+�D��#�}�%�j�kJ��\u0002��ϦPTl�s?�ܹ3\u0005�\u000b,ċO\u0018�����\u0002=A�\u000f͡��*\u001e.}^��zXD4�\u0004_�\u0010T8����*xX�?�+ر1�ylQ\u000f_痭�E�E7cdi�U�0�EY^\u0016�GL\\j ��\u000e|b,IA��്;��Za�K@��O*�A�l��s\u0004䕸��S&��!X�c\n�4߸�\u001cR�^e6P?�]v �\u001bF*\u000b#���m\u0003hE\u0010�s_��"
]
```

result:
```json ca.org1.example.com-cert
[
  [
    [
      "US",
      "California",
      "San Francisco",
      "org1.example.com",
      "ca.org1.example.com"
    ],
    [
      "170623123319Z",
      "270621123319Z"
    ],
    [
      "US",
      "California",
      "San Francisco",
      "org1.example.com",
      "ca.org1.example.com"
    ],
    "\u0000\u0004(�p�<ɬ��~B#����u�M�H�\u0016u&�Y�)\u0014���,<B�,n�8�?I$?�9&�x0��\n+z0�ې�\u0005",
    [
      "�",
      "�"
    ]
  ],
  "\u00000D\u0002 0��ȭ�o\u000b�\u0011s\u001c�\u0006��h�D�Rjv�\u001e��څB��\u0002 +\f�Ԓ�Fݞ�\u0003k(���?Y\u001bB��1\n��\u000f�_\t/"
]
```

you can clearly see the issue and subject, to verify if the datastructures are are valid and are signed correctly, 
you need to look elsewhere.