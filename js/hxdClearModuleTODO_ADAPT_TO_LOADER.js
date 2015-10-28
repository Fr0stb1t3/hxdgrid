/**
	Hexdgrid 0.2.4 ( Beta version ) Clear module
	This HxdGrid module removes all animations from the hdx item
	Copyright (c) 2015 Antoni Atanasov 
	License:  The current version project is licensed under GPLv3
	Project site: Coming Soon
	Github site: 
**/
var HxdClearProto = (function() {
	return HxdClearProto= {
		/* Super object. All the properties and methods in this object are shared between other variations */
		uid: 0, /* {itemCounter}@{PARENT_ID} */
		$elem: null,
		hxScale: 'hxd-l',
		startPos: null,
		cellBgColor: 0,
		xCor: 0,
		yCor: 0,
		setOptions: function(options) {
		  this.hxScale = ( options && options.hxScale)  || this.hxScale;
		  this.autoBind = ( options && options.autoBind ) || this.autoBind;
		  
		  if( typeof  options.cellBgColor !== 'undefined' && options.cellBgColor != 0)
			  if( validHex(options.cellBgColor)  ){
				  //console.log('valid color'+options.cellBgColor); 
				  this.cellBgColor = ( options && options.cellBgColor );
			  }else{
				  //console.log('Error.Options.Invalid color ('+options.cellBgColor+') provided. Input ignored. Please provide a valid hex string');
			  }
		},
		addAttr: function(key, value){
			if( !this.hasOwnProperty(key) ){
				this[key] = value;
			}else{
				//console.log('Attempting to override property. Use setAttribute instead');
			}
		},
		_passNodeAttributes: function(nNodeMap){
			for( i = 0; i < nNodeMap.length; i++ ){
				var node = nNodeMap.item(i);
				if((node.name.indexOf("data-hxd-") > -1)){
					this.addAttr(
						node.name.replace('data-hxd-', ''),//chop the name then store it as an attribute
						node.value 
					);
				}
			}
		},
		create: function(_this, hxScale) {
			var styleOver ='';
			var modeVar='tableMode';
			
			if( typeof  css(_this.$elem)[ 'background-color' ]!== 'undefined' ){
				var styleCol = rgbToHexString( css( _this.$elem )['background-color']);
				if( validHex( styleCol )  ){
					_this.cellBgColor = styleCol;
					_this.$elem.addClass('hxdColOverride');
					styleOver =  _this.colStyleOverride(_this);
				}
			}
			_this.hxScale= hxScale || _this.hxScale;
			_this.$elem.addClass(_this.hxScale);
			
			_this.$elem.wrapInner(
				"<div class='hxMiddle "+modeVar+"' "+styleOver[0]+"><div class='inner'></div></div>"
			);
			
			_this.$elem.prepend('<div class="hxLeft"'+styleOver[1]+'></div>');
			_this.$elem.append('<div class="hxRight"'+styleOver[2]+'></div>');
		},
		getXY: function(){
			return [ this.xCor, this.yCor ];
		},
		swapPos: function( hxItem2 ,_callback ){
			var hxItem1 = this;
			var me = hxItem1.getXY(),
				it = hxItem2.getXY();
				
			hxItem1.moveTo( it[0], it[1] );
			hxItem2.moveTo( me[0], me[1] );
			
			this.$elem.parent().trigger('binaryShift',{ 0 : hxItem1 , 1: hxItem2 } ) ;
			
			if (typeof  _callback!== 'undefined'){
				_callback();
			}
		},
		colStyleOverride: function( _this ){
			if( typeof  _this.cellBgColor !== 'undefined' && _this.cellBgColor !==0){
			return [
				 'style="background:' + _this.cellBgColor+'"',
				 "style='border-right-color:" + _this.cellBgColor+ "'",
				 "style='border-left-color:" + _this.cellBgColor+ "'" ];
			}
			return '';
		},
		moveTo: function( xCor, yCor, $elem ) {
			var $elem = $elem || this.$elem;
			var xCor = xCor;  
			var yCor = yCor;  
			if ( (typeof $elem.attr('style') !== 'undefined') ) {
				$elem.css({  left: xCor, top: yCor });/*				
				if (  this.isElementInViewport()) {
					this.animateOver(xCor, yCor );
				}else{
					
					if (this.CCSANIM) {
						console.log('cssFade');
						this.fadeOver(xCor,yCor, $elem);
					}else{
						$elem.filter(':not(:animated)').fadeOut('normal',function(){//Rewrite in vanilla
							$elem.css({  left: xCor, top: yCor });
							$elem.fadeIn('fast');
						});
					}
				}*/
			} else {
				$elem.attr('style',   'margin:0!important;float:none;position: absolute;left:' + xCor + 'px;top:' + yCor + 'px');
			}
			this.xCor = xCor;
			this.yCor = yCor;
		 },
		 fadeOver: function(xCor, yCor ,$elem ) {
			var elem = $elem || this.$elem; //
			elem = $elem.get(0);
			elem.style.WebkitTransition  = "  opacity  0.7s ease ";
			elem.style.MozTransition  = "  opacity  0.7s ease ";
			elem.style.transition = " opacity  1 linear 0s ";
			elem.style.opacity = "0";
			this.delayedOpacityShift(elem, 2 , 1500, xCor , yCor );
		},
		delayedOpacityShift: function( elem, op,delay, xCor, yCor ) {
			var delay = typeof delay==='undefined' ? 1000 : delay;
			setTimeout(function () {
				var xPx = xCor+'px';
				var yPx = yCor+'px';
				elem.style.left = xPx;
				elem.style.top = yPx
				elem.style.opacity = "1";
			}, delay);
		},
		hxGetYOffset:function(cellStyle) {
            var y1 = parseInt(cellStyle.height) * 1.015;
            return [
                (function(i) {
                    return (y1 * i);
                }), 
				(function(i) {
                    return (y1 * i) + ( parseInt(
						cellStyle['margin-top'] ) || 0 );
                })
            ];
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
