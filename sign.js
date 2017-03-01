const urlObj = require('url');
const fs = require('fs');
const https = require('https');

var createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000) + '';
};

var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

/**
* @synopsis 签名包 
*/
var JSSDK = {
  _getAccessToken : function () {
    return new Promise(function(resolve, reject){
      return fs.readFile('./access_token.json', 'utf8', (err, data) => {
        if (err) throw err;
        var json;

        try{
          json = JSON.parse(data);
        }catch(e){
          throw e;
        }

        //access_token 过期
        if (json.expire_time ? json.expire_time < new Date().getTime() : true){
          var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+JSSDK.appId+"&secret="+JSSDK.appSecret;
          var ret = https.get(url, (res) => {
            res.setEncoding('utf8');
            res.on('data', (body) => {
              try{
                body = JSON.parse(body);
                body.expire_time = new Date().getTime()+7000*1000;//毫秒数
              }catch(e){
                throw e;

              }
              fs.writeFile('./access_token.json', JSON.stringify(body), (err) => {
                if (err) throw err;
                resolve(body.access_token);
              })
            });
            res.on('end', () => {
              console.log('No more data in response.');
            });
          }).on('error', (e) => {
            throw e;
          });

        }else{//access_token未过期
          resolve(json.access_token);
        }
      })
    });

  },
  _getJsApiTicket : function (access_token) {
    return new Promise(function(resolve, reject){
      fs.readFile('./jsapi_ticket.json','utf8', (err, data) => {
        if (err) {
          console.log("err when read jsapi_ticket", err);
          throw err;
        }
        var json;
        try{
          json = JSON.parse(data);

        }catch(e){
          throw e;
        }
        if (json.expire_time ? json.expire_time < new Date().getTime() : true){
          
            var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token="+access_token;

            https.get(url, (res) => {
              
              res.on('data', (body) => {
                try{
                  body = JSON.parse(body);
                  body.expire_time = new Date().getTime()+7000*1000;//毫秒数
                }catch(e){
                  throw e;
                }
                fs.writeFile('./jsapi_ticket.json', JSON.stringify(body), (err) => {
                  if (err) throw err;
                  resolve(body.ticket);
                })
              });
            });
          
        }else{
          resolve(json.ticket);
        }
      });
    });
        
  },
  sign : function (appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    return this._getAccessToken()
      .then((access_token) => {
        return this._getJsApiTicket(access_token);
      })
      .then((jsapi_ticket) => {
          var ret = {
            jsapi_ticket: jsapi_ticket,
            nonceStr: createNonceStr(),
            timestamp: createTimestamp(),
            url: urlObj.href
          };
          var string = raw(ret);
              jsSHA = require('jssha');
              shaObj = new jsSHA('SHA-1', 'TEXT');
          shaObj.update(string);
          ret.signature = shaObj.getHash('HEX');

          return ret;
      });
  }
};
/**
 * example:
 */
// JSSDK.sign('wx2109fe8ff42bc387', 'xxxxsecretxxxx')
//   .then((ret) => {
//     console.info(ret);
//   })
//   .catch((err) => {
//     console.info(err);
//   });

module.exports = JSSDK.sign;
