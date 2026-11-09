// FlowForge WebStudio v0.8.1 - schemas específicos
window.FlowForgePropertySchema={
 common:['name','text','x','y','width','height','visible','enabled','background','color'],
 picturebox:['src','fit','alt','borderRadius','lazy','visible','enabled'],
 image:['src','fit','alt','borderRadius','lazy','visible','enabled'],
 label:['fontFamily','fontSize','bold','italic','underline','textAlign','visible','enabled'],
 heading:['fontFamily','fontSize','italic','underline','textAlign','visible','enabled'],
 button:['text','variant','icon','borderRadius','shadow','visible','enabled'],
 input:['text','placeholder','maxLength','readOnly','visible','enabled'],
 audio:['src','autoplay','loop','controls','muted','volume','visible','enabled'],video:['src','autoplay','loop','controls','muted','volume','poster','visible','enabled'],
 datagrid:['columns','striped','sortable','pageSize','visible'],chart:['chartType','chartTitle','chartLabels','values','chartSeries','legend','showValues','chartGrid','smooth','chartColors','valuePrefix','valueSuffix','yMin','yMax','maxPoints','animate','visible'],
 calendar:['value','min','max','visible'],camera:['facingMode','autoplay','hideCameraButton','muted','audio','fit','width','height','visible'],
 rating:['value','max','readOnly'],progress:['min','max','value','showText','barColor'],qrcode:['textContent','qrcodeSize','visible','enabled'],iframe:['src','lazy','visible','enabled'],canvas:['canvasWidth','canvasHeight','canvasBackground','visible','enabled'],map:['mapProvider','mapAddress','src','mapLat','mapLng','mapZoom','visible','enabled'],meterbar:['text','min','max','value','visible','enabled'],detailsbox:['text','description','visible','enabled'],textcounter:['text','placeholder','maxLength','visible','enabled'],
 drawer:['open','position','overlay'],bottomsheet:['open','height'],tabcontrol:['activeTab','tabs'],panel:['dock','anchor','overflow'],groupbox:['dock','anchor'],flexpanel:['direction','justify','align','gap','wrap'],gridpanel:['columns','rows','gap'],stackpanel:['direction','gap'],scrollpanel:['overflow'],timer:['interval','enabled','oneShot'],http:['url','method','headers'],websocket:['url','protocol','autoConnect'],storage:['key'],modal:['open','closeOnBackdrop'],carousel:['activeIndex','autoplay','interval'],
 searchbar:['placeholder','showClear','visible','enabled'],passwordbox:['placeholder','readOnly','visible','enabled'],numberbox:['value','min','max','step','readOnly','visible','enabled'],
 segmentedcontrol:['items','activeIndex','visible','enabled'],skeleton:['lines','visible','enabled'],progressring:['value','min','max','barColor','showText','visible','enabled'],
 emptystate:['description','actionText','visible','enabled'],codeblock:['code','language','showCopy','visible','enabled'],chat:['items','placeholder','sendText','visible','enabled'],
 signaturepad:['penColor','lineWidth','visible','enabled'],dropdownmenu:['items','visible','enabled'],popover:['content','placement','visible','enabled'],themetoggle:['visible','enabled'],
 gamecanvas:['canvasWidth','canvasHeight','fps','visible','enabled'],
 sprite:['src','rotation','vx','vy','collidable','visible','enabled'],
 spritesheet:['src','frameWidth','frameHeight','frames','fps','loop','autoplay','visible','enabled'],
 collisionarea:['tag','debug','visible','enabled'],
 keyboardinput:['enabled','preventDefault'],
 gamepadinput:['enabled','index','deadZone'],
 gametimer:['interval','oneShot','enabled'],
 scorelabel:['prefix','value','visible','enabled'],
 healthbar:['value','max','barColor','visible','enabled'],
 joystick:['deadZone','knobColor','visible','enabled'],
 geolocation:['highAccuracy','timeout','maximumAge','watch'],
 notification:['title','body','icon'],
 vibration:['pattern']
};
window.FlowForgePropertySchemaFor=k=>[...(FlowForgePropertySchema.common||[]),...(FlowForgePropertySchema[k]||[])];

FlowForge.registerModule('propertygrid',{
 schemaFor(kind){return window.FlowForgePropertySchemaFor(kind)},
 coerce(value,type){if(type==='number')return Number(value);if(type==='boolean')return value===true||value==='true';return value}
});
