/*!
 * socket.io-node
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */var util=require("./util"),toArray=util.toArray,levels=["error","warn","info","debug"],colors=[31,33,36,90];function pad(str){for(var max=0,i=0,l=levels.length;i<l;i++)max=Math.max(max,levels[i].length);return str.length<max?str+new Array(max-str.length+1).join(" "):str}var Logger=module.exports=function(opts){opts=opts||{},this.colors=opts.colors!==!1,this.level=3,this.enabled=!0};Logger.prototype.log=function(type){var index=levels.indexOf(type);return index>this.level||!this.enabled?this:(console.log.apply(console,[this.colors?"   \x1B["+colors[index]+"m"+pad(type)+" -\x1B[39m":type+":"].concat(toArray(arguments).slice(1))),this)},levels.forEach(function(name){Logger.prototype[name]=function(){this.log.apply(this,[name].concat(toArray(arguments)))}});
