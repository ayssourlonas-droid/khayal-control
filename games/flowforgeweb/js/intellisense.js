// IntelliSense modular v0.8.2
FlowForge.registerModule('intellisense',{
 providers:[],register(provider){this.providers.push(provider)},
 suggestions(context){return this.providers.flatMap(p=>{try{return p(context)||[]}catch{return []}})}
});
