## For Wechat jsapi sign with nodejs


```javascript

sign('wx2109fe8ff42bc387', 'xxxxsecretxxxx')
  .then((signPackage) => {
    console.info(signPackage);
  })
  .catch((err) => {
    console.info(err);
  });
```
then you got signPackage like this:
```
{ 
	jsapi_ticket: 'kgt8ON7yVITDhtdwci0qeVKRKrcGb8mHjDv0Rqyf8bOkarQRtozWRRTY4RdKF_58Cdy2HTNW2XhIYDS5V-s7uQ',
	nonceStr: 'mhztuxlrjs0mrk5',
	timestamp: '1488360092',
	url: 'http://a.b.com/c',
	signature: '995c1350abc7fa33f0d3a76207ed5d1c367e1aae' 
}
```