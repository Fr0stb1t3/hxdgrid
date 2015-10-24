/**
	Hexdgrid 0.2.4 ( Beta version ) Hex  module
	This HxdGrid module applies a border hex object.
	Copyright (c) 2015 Antoni Atanasov 
	License:  The current version project is licensed under GPLv3
	Project site: Coming Soon
	Github site: 
**/
var HxdHexModule = (function() {
	return HxdHexProto= {
		create: function(_this, hxScale) {
			var styleOver ='';
			var classVar = 'hxHex';
			var inlineBG = _this.$elem.get(0).style[ 'background-color' ];
			if( typeof  css(_this.$elem)[ 'background-color' ]!== 'undefined' ){
				var styleCol = rgbToHexString( css( _this.$elem )['background-color']) ;
			}else if(typeof inlineBG!== 'undefined' &&inlineBG.length > 13 ){
				
				var styleCol = rgbToHexString( inlineBG ) ;
				
			}
			if( typeof styleCol !== 'undefined'  && validHex( styleCol )  ){
				_this.cellBgColor = styleCol;
				_this.$elem.addClass('hxdColOverride');
				styleOver =  _this.colStyleOverride(_this);
			}
			_this.hxScale= hxScale || _this.hxScale;
			_this.$elem.addClass(classVar);
			_this.$elem.addClass(_this.hxScale);
			
			_this.$elem.wrapInner(
				"<div class='hxMiddle'  "+styleOver[0]+"><div class='inner'></div></div>"
			);
			
			_this.$elem.prepend('<div class="hxLeft"'+styleOver[1]+'></div>');
			_this.$elem.append('<div class="hxRight"'+styleOver[2]+'></div>');
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
        var sheets = document.styleSheets,
            o = {};
        for (var i in sheets) {
            var rules = sheets[i].rules || sheets[i].cssRules;
            for (var r in rules) {
                if (a.is(rules[r].selectorText)) {
                    o = $.extend(o, css2json(rules[r].style), css2json(
                        a.attr('style')));
                }
            }
        }
        return o;
    }

    function css2json(css) {
        var s = {};
        if (!css) return s;
        if (css instanceof CSSStyleDeclaration) {
            for (var i in css) {
                if ((css[i])
                    .toLowerCase) {
                    s[(css[i])
                        .toLowerCase()] = (css[css[i]]);
                }
            }
        } else if (typeof css == "string") {
            css = css.split("; ");
            for (var i in css) {
                var l = css[i].split(": ");
                s[l[0].toLowerCase()] = (l[1]);
            }
        }
        return s;
    }
	
})();
