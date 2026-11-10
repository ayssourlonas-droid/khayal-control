/*!
 * socket.io-node
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */exports.toArray=function(enu){for(var arr=[],i=0,l=enu.length;i<l;i++)arr.push(enu[i]);return arr},exports.unpack=function(buffer){for(var n=0,i=0;i<buffer.length;++i)n=i==0?buffer[i]:n*256+buffer[i];return n},exports.padl=function(s,n,c){return new Array(1+n-s.length).join(c)+s};
