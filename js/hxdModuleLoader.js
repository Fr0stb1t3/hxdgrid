/**
	Hexdgrid 0.2.4 ( Beta version ) Hex  module
	This HxdGrid module loader
	Copyright (c) 2015 Antoni Atanasov 
	License:  The current version project is licensed under GPLv3
	Project site: Coming Soon
	Github site: 
**/
var modules = {};
modules[0] 	= typeof HxdClipModule  === 'undefined' 	? 0 : HxdClipModule;
modules[1] 	= typeof HxdHexModule   === 'undefined' 	? 0 : HxdHexModule;
/*
var module[2]  	= typeof module[2]   === 'undefined' 	? 0 : HxdClipModule;
var module[3]  	= typeof module[3]   === 'undefined' 	? 0 : HxdClearProto;
var module[4]  	= typeof module[4]   === 'undefined' 	? 0 : HxdRModule;
*/
var HxdModuleLoader = (function() {
	var constructorCache = [];
	var protoCache = [];
	console.log(modules)
	/* EXAMPLE CONDITION
	if(hexModule && _this.hexMode){
		if( clipModule && _this.clipping && $(this).hasClass("hxdClip") ){ // add control option to enable clipping for all  //classList.contains
			_this.items[i] =  new HxdItemClip( $(this) , _this.cellOptions); //new HxdItem($(this), _this.cellOptions);
		}
		else if( clipModule && _this.clipping  && $(this).find('img').length != 0 ){//add control option to disable clipping
			_this.items[i] =  new HxdItemClip( $(this) , _this.cellOptions); 
		}
		else{
			_this.items[i] =  new HxdItemSquare( $(this) , _this.cellOptions);
		}
	}
	else{//default non clipping object	
		_this.items[i] =  new HxdItem( $(this) , _this.cellOptions); //new HxdItem($(this), _this.cellOptions);
	}
	
	*/
	var moduleSelectFunction = function( _this, cellOptions, $elem , HxdItem){
		for (var i in modules) {
			console.log('Module '+i);
			var cond = modules[i].HxdCondition( _this, cellOptions, $elem );
			if( cond ){
				if( typeof constructorCache[i] ==='undefined' ){
					var obj = modules[i].constOb;
					console.log('CACHING CONSTRUCTOR');
					if( typeof protoCache[i] ==='undefined' ){
						console.log(modules[i].protoOb);
						protoCache[i] = modules[i].protoOb;
						console.log('CACHING PROTOTYPE');
					}
					extendProto( obj, HxdItem );			//add the core object to the prototype chain
					addToProto( obj , modules[i].protoOb );
					constructorCache[i]  = obj;
				}else{
					console.log('Loading cache');
					console.log(constructorCache[i] );
				}
				//console.log('CONSTRUCTOR');
				return new constructorCache[i]( $elem , cellOptions );
				//console.log('-CONSTRUCTOR');
			}
		}
		return new HxdItem( $elem , cellOptions );
	};
	return {
		moduleSelect : moduleSelectFunction
	};
	
	
	/* OOP Control functions*/
	function extendProto(obj, superobj){
		obj.prototype = { __proto__ :superobj.prototype}
	}
	function addToProto(coreObj,extraObj){
		for (var key in extraObj) {
			coreObj.prototype[key] = extraObj[key];
		}
	}
	function overProto(obj, proto){
		obj.prototype = proto;
	}
})();
