/**
	Hexdgrid 0.2.5 ( Beta version ) Module loader
	This is the HxdGrid module loader. It checks for previously included script modules and then allows the hexgrid to load an appropriate module for a given option setting
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
	/* 
		To do
			- Reverse array before use. Allowing newer modules to be appended to the end
			- Figure out a way (if possible) to auto load/ pre-load scripts from a provided location
			- Write documentation on Usage
			
			Possible improvement. Convert constructor and Proto caches to objects. This will allow mixing prototypes and constructors
	*/
	var moduleSelectFunction = function( _this, cellOptions, $elem , HxdItem){
		for ( var i in modules ) {
			if( modules[i] !== 0 ){
				var cond = modules[i].HxdCondition( _this, cellOptions, $elem );// Evaluates the condition specified in the module file
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
					}
					
					return new constructorCache[i]( $elem , cellOptions );
				}
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
