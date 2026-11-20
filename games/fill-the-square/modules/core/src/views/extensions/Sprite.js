core.Sprite=cc.Sprite.extend({hitTestChecker:null,ctor:function(fileName,rect,rotated){this._super(fileName,rect,rotated),this.hitTestChecker=new core.HitTestChecker(this)}});
