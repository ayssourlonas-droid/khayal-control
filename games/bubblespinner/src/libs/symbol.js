let Symbol=window.Symbol,idCounter=0;Symbol||(Symbol=function(key){return`__${key}_${Math.floor(Math.random()*1e9)}_${++idCounter}__`},Symbol.iterator=Symbol("Symbol.iterator")),window.Symbol=Symbol;
