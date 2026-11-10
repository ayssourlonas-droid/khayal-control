/*!
 * socket.io-node
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */exports=module.exports=Store;var EventEmitter=process.EventEmitter;function Store(options){this.options=options,this.clients={}}Store.prototype.__proto__=EventEmitter.prototype,Store.prototype.client=function(id){return this.clients[id]||(this.clients[id]=new this.constructor.Client(this,id)),this.clients[id]},Store.prototype.destroyClient=function(id,expiration){return this.clients[id]&&(this.clients[id].destroy(expiration),delete this.clients[id]),this},Store.prototype.destroy=function(clientExpiration){for(var keys=Object.keys(this.clients),count=keys.length,i=0,l=count;i<l;i++)this.destroyClient(keys[i],clientExpiration);return this.clients={},this},Store.Client=function(store,id){this.store=store,this.id=id};
