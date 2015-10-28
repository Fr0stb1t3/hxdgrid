/**
	Hexdgrid 0.2.4 ( Beta version ) Hex  module
	This HxdGrid module applies a border hex object.
	Copyright (c) 2015 Antoni Atanasov 
	License:  The current version project is licensed under GPLv3
	Project site: Coming Soon
	Github site: 
**/
var HxdHexModule = (function() {
	return { 
	HxdCondition: function( gridObject, cellOptions, $elem ){
		return gridObject.hexMode;
	},
	constOb: function($elem,cellOptions) {
			this.$elem=$elem;
			this.setOptions(cellOptions);
			this.create(this);
	},
	protoOb :{
		create: function(_this, hxScale) {
			var styleOver ='',
				classVar = 'hxHex',
				inlineBG = _this.$elem.get(0).style[ 'background-color' ],
				bgCSS = css(_this.$elem)[ 'background-color' ];
			if( typeof  bgCSS!== 'undefined' && bgCSS!=='transparent'){
				var styleCol = rgbToHexString( bgCSS ) ;
			}else if(typeof inlineBG!== 'undefined' &&inlineBG.length > 13 ){
				var styleCol = rgbToHexString( inlineBG ) ;
			}
			
			if( typeof styleCol !== 'undefined'  && validHex( styleCol )  ){
				_this.cellBgColor = styleCol;
				//_this.$elem.addClass('hxdColOverride');
				styleOver =  _this.hexStyleOverride(_this);
			}
			
			_this.hxScale= hxScale || _this.hxScale;
			_this.$elem.addClass(classVar);
			_this.$elem.addClass(_this.hxScale);
			
			_this.$elem.wrapInner(
				"<div class='hxMiddle'  "+styleOver[0]+"><div class='inner'></div></div>"
			);
			
			_this.$elem.prepend('<div class="hxLeft"'+styleOver[1]+'></div>');
			_this.$elem.append('<div class="hxRight"'+styleOver[2]+'></div>');
		},
		hexStyleOverride: function( _this ){
			if( typeof  _this.cellBgColor !== 'undefined' && _this.cellBgColor !==0){
			var eW = _this.$elem.width();
			var eH = _this.$elem.height();
			return [
				 'style="background:' + _this.cellBgColor+'"',
				 "style='border-right-color:" + _this.cellBgColor+ "'",
				 "style='border-left-color:" + _this.cellBgColor+ "'" ];
			}
			return '';
		}
	}
}


function rgbToHexString(string) {
		 var RGB = string.split("(")[1].split(")")[0].split(",");
		 return rgbToHex( RGB[0], RGB[1], RGB[2] );
	}
	
	function rgbToHex(r, g, b) {
		return "#" + componentToHex( r ) + componentToHex( g ) + componentToHex( b );
	}
	function componentToHex( c ) {
		c = parseInt(c);
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}
	function validHex(inp){
		return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(inp));
	}
	function css(a) { // <-- Inefficient.Goes though all stylesheets . Will pose a problem for scalability. To do, Replace
		var propArr = ['width',
				'height',
				'opacity',
				'background-image',
				'background-repeat',
				'background-position',
				'background-color',
				'margin-right',
				'margin-left',
				'margin-top',
				'margin-bottom'];//relevant properties
		return  getStyleProperties(a.get(0),propArr) ;
    }
	function getStyleProperties (el, propArr) {
		var outJSON = {}
		for(var i = 0,  len = propArr.length; i<len; i++){
			if (getComputedStyle !== 'undefined') {
				outJSON[ propArr[i] ] = getComputedStyle(el, null).getPropertyValue(propArr[i]);//;
			} else {
				outJSON[ propArr[i] ] = el.currentStyle[propArr[i]];
			}
		}
		return outJSON;
	}
	function getStyleProperty (el, prop) {
		if (getComputedStyle !== 'undefined') {
			return getComputedStyle(el, null).getPropertyValue(prop);//;
		} else {
			return el.currentStyle[prop];
		}
	}
	
})();
