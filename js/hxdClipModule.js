/**
	Hexdgrid 0.2.5 ( Beta version ) Hex clip module
	This HxdGrid module applies a SVG hex clipping mask
	Copyright (c) 2015 Antoni Atanasov 
	License:  The current version project is licensed under GPLv3
	Project site: Coming Soon
	Github site: 
**/
var HxdClipModule = (function() {
	var CLIPPING_DEP = typeof  ClipPath!== 'undefined';
	 /** 
		Clip Path mods and overrides
		Original made by Karol Andrusieczko --> https://github.com/andrusieczko/clip-path-polygon
	**/
	if ( CLIPPING_DEP ) {
		ClipPath.prototype.apply = function($el, points) {
			if (this.isForSvg) {
				$el.css('clip-path', 'url(#' + this.svgDefId + ')');
			}
			if (this.isForWebkit) {
				var clipPathI = "polygon(" + this._translatePoints(points,
					true, this.isPercentage) + ")";
				$el.css('-webkit-clip-path', clipPathI);
			}
		};
		ClipPath.prototype._createSvgBasedClipPath = function(points) {
			this.$('#' + this.svgDefId + '')
				.find('polygon')
				.attr('points', this._translatePoints(points, false, this.isPercentage));
			this.$el.css('clip-path', 'url(#' + this.svgDefId + ')');
		};
		
	}else{
		console.error('WARNING:Dependency missing. This version requires jQuery clip-path-polygon Plugin v0.1.5 Accessible from-->https://github.com/andrusieczko/clip-path-polygon');
	};
	
	return {
		HxdCondition: function( gridObject, cellOptions, $elem ){
			return gridObject.clipping && ($elem.hasClass("hxdClip") || $elem.find('img').length != 0 );
		},
		constOb: function($elem,cellOptions) {
				this.$elem=$elem;
				this.setOptions(cellOptions);
				this.create(this);
		},
		protoOb: {
		/* SVG clip Item*/
			clipPath: 0,
			clipPathObj: 0,
			cssAnim: false,
			hxScale: 'hxd-m',
			clipPathPObj: 0,
			create: function( _this, hxScale ) {
				var styleOver ='',
					modeVar='', 
					classVar = 'hxHex',
					bgCSS = css(_this.$elem)[ 'background-color' ];
					
				if( typeof bgCSS!== 'undefined' && bgCSS!== 'transparent'){//transparent
					var styleCol = rgbToHexString( bgCSS );
					if( validHex( styleCol )  ){
						_this.cellBgColor = styleCol;
						_this.$elem.addClass('hxdColOverride');
						styleOver =  _this.colStyleOverride(_this);
					}
				}
				
				
				_this.hxScale= hxScale || _this.hxScale;
				_this.$elem.addClass(classVar);
				_this.$elem.addClass(_this.hxScale);
				
				_this.$elem.wrapInner(
					"<div class='hxMiddle "+modeVar+"' "+styleOver[0]+"><div class='inner'></div></div>"
				);
				
				//Optional Setting
				if ( CLIPPING_DEP && ( false || ( _this.$elem.find("img").length > 0 ) ) ) {
					
					_this.$elem = this.$elem.wrapInner("<div class='hxClip' ></div>");
					
					if (_this.clipPath == 0) {
						var temp = this.$elem.find('.inner').html();
						this.$elem.find('.inner').empty();
						_this.clipPath = this.hxGetClipPath(_this);
						_this.clipPathP = this._hxGetClipPathPerc();
						this.$elem.find('.inner').html(temp);
					}
					
					_this.hxClipPath(_this.clipPath,'',_this);
					_this.bindZoom(_this);
					
				} else {
					_this.$elem.prepend('<div class="hxLeft"'+styleOver[1]+'></div>');
					_this.$elem.append('<div class="hxRight"'+styleOver[2]+'></div>');
				}
				
				//Optional Setting TO DO: Improve
				if ( false ) {
					_this.$elem.hover(function() {
						$(this).filter(':not(:animated)')
								.animate({ opacity: '1' }, 'normal');
					}, function() {
						$(this).animate({ opacity: '0.5' }, 'normal');
					});
				}
			},
			setOptions: function(options) {
				  this.hxScale = ( options && options.hxScale)  || this.hxScale;
				  this.autoBind = ( options && options.autoBind ) || this.autoBind;
				  
				  if( typeof  options.bgColor !== 'undefined' && options.bgColor != 0)
					  if( validHex(options.bgColor)  ){
						  this.bgColor = ( options && options.bgColor );
					  }else{
						  throw new HxdException('HxdError -> Options.Invalid color ('+options.bgColor+') provided. Input ignored. Please provide a valid hex string');
					  }
				},
			hxClipPathPerc:function(points, options,_this) {
				_this = _this || this;
				var $el = _this.$elem.find('.hxClip');
				if (_this.clipPathPObj == 0) {
					_this.clipPathPObj = new ClipPath($, $el, points,
						options);
					_this.clipPathPObj.create();
				} else {
					_this.clipPathPObj.apply($el, points);
				}
			},
			hxClipPath:function(points, options, _this) {
				_this = _this || this;
				var $el = _this.$elem.find('.hxClip');
				
				if (_this.clipPathObj == 0) {
					_this.clipPathObj = new ClipPath($, $el, points,
						options);
					_this.clipPathObj.create();
				} else {
					_this.clipPathObj.apply($el, points);
				}
			},
			hxGetClipPath:function(_this) { //Move to object
				$elem = _this.$elem;
				if (!$elem instanceof jQuery) {
					$elem = $($elem);
				}
				var w = $elem.width(),
					h = $elem.height(),
					lw = $elem.find('.hxMiddle').width(),
					mid = ( w - lw ) / 2;
				return [
					[0, h / 2],
					[mid, 0],
					[mid + lw, 0],
					[w, h / 2],
					[mid + lw, h],
					[mid, h],
					[0, h / 2]
				];
			},
			bindZoom:function( _this ){//REFACTOR Into several functions
				_this.$elem.find('.inner').css('cursor', 'pointer');
				_this.$elem.bind( "click", function() {
					_this = _this || this;
					//console.log(_this);
					if(!$(this).hasClass('hxZoom') ){//<-- add percentage for zoom
						_this.$elem.on( "hxHideLast", {
							//Variable placeholder
						}, function( event, arg1, arg2 ) {
							_this.$elem.filter(':not(:animated)').animate({width: '-=220',height: '-=220',top:'+=110',left:'+=110'}, 500,
							function(){
								$(this).css("z-index","1");
								_this.hxClipPath(_this.clipPath, {  } , _this);
								$(this).removeClass('hxZoom');
								_this.$elem.off( "hxHideLast");//Unbind cleanup
							});
						});
						$( '.hxZoom' ).trigger( "hxHideLast");
						$(this).addClass('hxZoom');
						_this.hxClipPathPerc(_this.clipPathP, { isPercentage: true} , _this);
						$(this).filter(':not(:animated)').animate({width: '+=220',height: '+=220',top:'-=110',left:'-=110'}, 500);
						$(this).css("z-index","999");
					}else{
							$(this).filter(':not(:animated)').animate({width: '-=220',height: '-=220',top:'+=110',left:'+=110'}, 500,function(){
									$(this).css("z-index","1");
									_this.hxClipPath(_this.clipPath, {  } , _this);
							$(this).removeClass('hxZoom');
						});
					}
				});
			},
			_hxGetClipPathPerc:function() {// Move to item object
				return [
					[0, 50],
					[20, 0],
					[80, 0],
					[100, 50],
					[80, 100],
					[20, 100],
					[0, 50]
				];
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
