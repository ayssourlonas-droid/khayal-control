/*!
 * socket.io-node
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */var HTTPTransport=require("./http");exports=module.exports=HTMLFile;function HTMLFile(mng,data,req){HTTPTransport.call(this,mng,data,req)}HTMLFile.prototype.__proto__=HTTPTransport.prototype,HTMLFile.prototype.name="htmlfile",HTMLFile.prototype.handleRequest=function(req){HTTPTransport.prototype.handleRequest.call(this,req),req.method=="GET"&&(req.res.writeHead(200,{"Content-Type":"text/html; charset=UTF-8",Connection:"keep-alive","Transfer-Encoding":"chunked"}),req.res.write("<html><body><script>var _ = function (msg) { parent.s._(msg, document); };<\/script>"+new Array(174).join(" ")))},HTMLFile.prototype.write=function(data){data="<script>_("+JSON.stringify(data).replace(/\//g,"\\/")+");<\/script>",this.response.write(data)&&(this.drained=!0),this.log.debug(this.name+" writing",data)};
