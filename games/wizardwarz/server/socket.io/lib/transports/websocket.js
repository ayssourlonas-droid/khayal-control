/*!
 * socket.io-node
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */var protocolVersions=require("./websocket/");exports=module.exports=WebSocket;function WebSocket(mng,data,req){var transport,version=req.headers["sec-websocket-version"];return typeof version<"u"&&typeof protocolVersions[version]<"u"?transport=new protocolVersions[version](mng,data,req):transport=new protocolVersions.default(mng,data,req),typeof this.name<"u"&&(transport.name=this.name),transport}
