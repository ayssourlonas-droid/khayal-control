/*!
 * socket.io-node
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */var HTTPPolling=require("./http-polling");exports=module.exports=XHRPolling;function XHRPolling(mng,data,req){HTTPPolling.call(this,mng,data,req)}XHRPolling.prototype.__proto__=HTTPPolling.prototype,XHRPolling.prototype.name="xhr-polling",XHRPolling.prototype.doWrite=function(data){HTTPPolling.prototype.doWrite.call(this);var origin=this.req.headers.origin,headers={"Content-Type":"text/plain; charset=UTF-8","Content-Length":data===void 0?0:Buffer.byteLength(data),Connection:"Keep-Alive"};origin&&(headers["Access-Control-Allow-Origin"]=origin,headers["Access-Control-Allow-Credentials"]="true"),this.response.writeHead(200,headers),this.response.write(data),this.log.debug(this.name+" writing",data)};
