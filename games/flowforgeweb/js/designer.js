// Designer modular v0.8.2
FlowForge.registerModule('designer',{
 version:'0.8.2', snap(value,grid=8){return Math.round(value/grid)*grid},
 clamp(value,min,max){return Math.max(min,Math.min(max,value))},
 devicePresets:{mobile:{width:390,height:844},tablet:{width:768,height:1024},desktop:{width:1440,height:900}}
});
