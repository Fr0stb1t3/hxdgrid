/**
	Hexdgrid 0.2.4 ( Beta version )
	HxdGrid is a front end script for ordering and sorting elements in a responsive grid layout.
	Copyright (c) 2015 Antoni Atanasov 
	License:  The current version project is licensed under GPLv3 at a later stage this may change to a dual license
	For more information check the Readme
	Project site: Coming Soon
	Github site: 
**/
/** Beta Version **/
var jQuery = jQuery || (require && require('jquery'));
/*
var HxdHexModule 	= typeof HxdHexModule === 'undefined' 	? 0 : HxdHexModule;
var HxdClipModule 	= typeof HxdClipModule === 'undefined' 	? 0 : HxdClipModule;
var HxdClearProto 	= typeof HxdClearProto === 'undefined' 	? 0 : HxdClearProto;
var HxdRModule 		= typeof HxdRModule === 'undefined' 	? 0 : HxdRModule; */
var HxdModuleLoader = typeof HxdModuleLoader === 'undefined' 	? 0 : HxdModuleLoader;

(function($) {
	  
	  /* IE console out fix Ignore this bit*/
	  var methods = ["assert", "cd", "clear", "count", "countReset",
		"debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed",
		"groupEnd", "info", "log", "markTimeline", "profile", "profileEnd",
		"select", "table", "time", "timeEnd", "timeStamp", "timeline",
		"timelineEnd", "trace", "warn"];
	  var length = methods.length;
	  var console = (window.console = window.console || {});
	  var method;
	  var noop = function() {};
	  while ( length-- ) {
		method = methods[length];
		// define undefined methods as noops to prevent errors
		if (!console[method])
		  console[method] = noop;
	  }
	/*End of IE FIX FLUFF*/
	
    /** Global vars **/
	var gridIdCounter = 0;
	
	
	/* Not so global variables */
	/* To do: Encapsulate vars in the objects */
    var reflowLock = true;
    var resizeLock = true;
	
	/* Core Grid Object */
	var HxdGrid =  function(jQuery, $el, options) {
		var _this = this;
		_this._id = gridIdCounter;
		_this.$el= $el;
		_this.items=[];
		$el.addClass('hxdGridContainer');
		_this.setOptions(options);
		_this.create(jQuery, _this);
		
		
		/* CLEANUP REQUIRED */
		var rtime;
		var timeout = false;
		var delta = 200;
		
		function resizeEnd() {
			if ( new Date() - rtime < delta ) {
				setTimeout(resizeEnd, delta);
			} else {
				timeout = false;
				
				if (resizeLock) {
					resizeLock = false;
					_this.reflowHexRows(function() {
						resizeLock = true;
					});
				}
				//console.log('Done resizing');
			}               
		}
		window.addEventListener('resize', function(event){
				rtime = new Date();
				if (timeout === false) {
					timeout = true;
					setTimeout(resizeEnd, delta);
				}
		});
		/*END Of messy Block */
		gridIdCounter++;
	};
	

	/* Core item object and prototype */
	var HxdItem = function($elem,cellOptions) {
		this.$elem = $elem;
		this.cssAnim = true;
		this.harwareAccelaration = false;//Triggers the hardware acceleration css
		this.setOptions(cellOptions);
		this.create(this);
	}
	HxdItem.prototype = {
		/* Base prototype. All the properties and methods in this object are shared between other variations */
		_id: 0, /* {itemCounter}@{PARENT_ID} */
		$elem: null,
		hxScale: '',
		startPos: null,
		cellBgColor: 0,
		hexMode: false,
		viewportFading: false,
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
			console.log( 'square' );
			var styleOver ='';
			if( typeof  css(_this.$elem)[ 'background-color' ]!== 'undefined' ){
				var styleCol = rgbToHexString( css( _this.$elem )['background-color']);
				if( validHex( styleCol )  ){
					_this.cellBgColor = styleCol;
					_this.$elem.addClass('hxdColOverride');
					styleOver =  _this.colStyleOverride(_this);
				}
			}
			modeVar='hxDefault';
			_this.$elem.wrapInner(
				"<div class='hxMiddle "+modeVar+"' "+styleOver[0]+"><div class='inner'></div></div>"
			);
			
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
			var parent_id = (this._id.split("@"))[0] ;
			this.$elem.parent().trigger('binaryShift'+parent_id,{ 0 : hxItem1 , 1: hxItem2 } ) ;
			
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
			if ( (typeof $elem.attr('style') !== 'undefined') && $elem.get(0).style.position=='absolute' ) { 
				if ( this.isElementInViewport(xCor, yCor ) || !this.viewportFading  ) {//this.isElementInViewport()
					this.animateOver(xCor, yCor );
				}else{
					if (this.cssAnim) {
						console.log('cssFade');
						this.fadeOver(xCor,yCor, $elem);
					}else{
						$elem.filter(':not(:animated)').fadeOut('normal',function(){
							$elem.css({  left: xCor, top: yCor });
							$elem.fadeIn('fast');
						});
					}
				}
			} else {
				$elem.attr('style',   'margin:0!important;float:none;position: absolute;left:' + xCor + 'px;top:' + yCor + 'px');
			}
			this.xCor = xCor;
			this.yCor = yCor;
		 },
		 animateOver: function(xCor, yCor ,$elem ) {
			var $elem = $elem || this.$elem;
			if (!this.cssAnim) {
				if ($elem.position() < yCor) {
					$elem
						.filter(':not(:animated)')
						.animate({ top: yCor}, 'normal')
						.animate({ left: xCor }, 'normal');
				} else {
					$elem
						.filter(':not(:animated)')
						.animate({ left: xCor }, 'normal')
						.animate({ top: yCor }, 'normal');
				}
			}else{
				if(this.harwareAccelaration){
					$elem.get(0).style.WebkitTransform  = "  translate3d(0, 0, 0)";
					$elem.get(0).style.MozTransform = "  translate3d(0, 0, 0) ";// ease-out// ease
					$elem.get(0).style.transform = " translate3d(0, 0, 0) ";
				}
				$elem.get(0).style.WebkitTransition  = "  all 0.7s ease ";
				$elem.get(0).style.MozTransition  = "  all 0.7s ease ";// ease-out// ease
				$elem.get(0).style.transition = " all 1s ease  ";
				var xPx = xCor+'px';
				var yPx = yCor+'px';
				if ($elem.position() < yCor) {
					if(  $elem.get(0).style.left != xPx )
						$elem.get(0).style.left = xPx;
					
					if( $elem.get(0).style.top != yPx )
						delayedY($elem.get(0) ,yPx ,1000);
				}else{
					if( $elem.get(0).style.top != yPx )
						$elem.get(0).style.top = yPx;
					if(  $elem.get(0).style.left != xPx )
						delayedX($elem.get(0) ,xPx ,1000);
				}
				
				
			}
			function delayedY( elem, top,delay ) {// To Do Move
				var delay = typeof delay==='undefined' ? 1000 : delay;
				setTimeout( function () {
						elem.style.top = top ;
					}, delay);
			}
			function delayedX( elem, left,delay ) {// To Do Move
				var delay = typeof delay==='undefined' ? 1000 : delay;
				setTimeout( function () {
						elem.style.left = left ;
					}, delay);
			}
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
		forceVisible: function(){//IMPROVE
			this.$elem.fadeIn("slow", "linear");
		},
		toggleVisible: function(speed){
			var speed = speed || 'slow';
			this.$elem.fadeToggle("slow", "linear");
		},
		isElementInViewport: function(xCor,yCor) {
			el = this.$elem;
			var rect = el[ 0 ].getBoundingClientRect();
			var visOffset = 100; 
			return (
				rect.top >= ( 0 - visOffset ) &&
				rect.left >= ( 0 - visOffset )  &&
				rect.bottom <= ( (window.innerHeight + visOffset ) || (document.documentElement.clientHeight + visOffset ) ) && /*or $(window).height() */
				rect.right <= ( ( window.innerWidth + visOffset ) || (document.documentElement.clientWidth + visOffset ) ) /*or $(window).width() */
			);
		 },
		 moveInViewport: function(xCor,yCor){ /* TO DO  */
			el = this.$elem;
			var rect = el[ 0 ].getBoundingClientRect();
			var visOffset = 0; //Fix
			//console.log( rect );
			var tO =  parseInt(el[0].style.top) - yCor;
			var lO =   parseInt(el[0].style.left) - xCor ;
			if(this.startPos ==10){
				console.log( '----Element-----' );
				console.log( parseInt(el[0].style.top) );
				console.log( yCor );
				console.log( tO );
				console.log( rect.top );
				console.log( '----X:-----' );
				console.log( parseInt(el[0].style.left) );
				console.log( xCor );
				console.log( lO );
				console.log( rect.left );
				console.log( rect.left - lO );
				console.log( '----Element-----' );
			}
			var bool = (
				( rect.top - tO ) >= ( 0 - visOffset ) &&
				( rect.left - lO ) >= ( 0 - visOffset )  &&
				( rect.bottom - tO ) <= ( (window.innerHeight + visOffset ) || (document.documentElement.clientHeight + visOffset ) ) && /*or $(window).height() */
				( rect.right - lO ) <= ( ( window.innerWidth + visOffset ) || (document.documentElement.clientWidth + visOffset ) ) /*or $(window).width() */
			);
			return bool || this.isElementInViewport;
		 } ,
		 hxGetYOffset:function(cellStyle) {
            var y1 = parseInt(cellStyle.height) * 1.015;
            return [
                ( function(i) {
                    return (y1 * i);
                }), 
				( function(i) {
                    return (y1 * i) + ( parseInt(
						cellStyle['margin-top'] ) || 0 );
                })
            ];
        }
	}
	
	/**
	* Optional imports follow here. They allow adding different behaviour to the item objects.
	* This is controlled at the create stage of the grid prototype. 
	* Depending on a preset (currently hard coded) condition, the grid object can implement the appropriate item object.
	* Example in demo: Hex module & Hex module + Clip Module
	**/
	
	/*
		REPLACED WITH Module loader object. 
			The module loader receives option parameters and returns the appropriate hxdObbject;

	*/
	/* IMPORT Rotated module
	//if( HxdRModule !== 0 ){ Deprecated
	//	addToProto( HxdItem , HxdRModule );
	//}
	/* IMPORT Clear module 
	if( HxdClearProto !== 0 ){
		HxdItem.prototype = HxdClearProto;
	}
	/* IMPORT Hex module
	var hexModule = true;
	if( HxdHexModule !== 0 ){
		var HxdItemSquare = function($elem,cellOptions) {
			this.$elem=$elem;
			this.setOptions(cellOptions);
			this.create(this);
		}
		extendProto( HxdItemSquare , HxdItem );			//add the core object to the prototype chain
		addToProto( HxdItemSquare , HxdHexModule );		// adds the additional prototype attributes and methods
	}else{
		hexModule = false;
	}
	
	if( HxdModuleLoader !== 0 ){
		var modules  = HxdModuleLoader.modules
		console.log(HxdModuleLoader);
		for (var i in modules) {
			console.log('Loading'+i);
			console.log(modules[i]);
		}
	}
	var clipModule = true;
	if( HxdClipModule !== 0 ){
		var HxdItemClip = function($elem,cellOptions) {
			this.$elem = $elem;
			this.setOptions( cellOptions );
			this.create(this);
		}
		extendProto( HxdItemClip, HxdItem );//add the core object to the prototype chain
		addToProto( HxdItemClip , HxdClipModule );// adds the additional prototype attributes and methods
	}else{
		clipModule = false;
	}
	*/
	/* Core Grid prototype */
	HxdGrid.prototype = {
		_id: 0,
		$: null,
		$el: null,
		clipping: 0, 
		resize: true,  
		selector:  '.hxdItem',
		hiddenItems: [],
		gridId: null,
		cellStyle: 0 ,
		cellOptions: {},
		setOptions: function(options) {
			
		  /*container options */
		  this.clipping 	= ( options && options.clipping) 		|| this.clipping;
		  this.resize 		= ( options && options.resize) 			|| this.resize;
		  this.selector 	= ( options && options.selector) 		|| this.selector;
		  this.hexMode 		= ( options && options.hexMode) 		|| this.hexMode;
		 
		  /* Item options*/
		  this.cellOptions.hxScale 		= ( options && options.hxScale)  || 'hxd-xl';
		  this.cellOptions.autoBind 	= ( options && options.autoBind) || 0;
		  this.cellOptions.cellBgColor 	= ( options && options.cellBgColor) || 0;
		},
		/**
		*	create
		*	Prepares the container object and identifies the hxdItem objects,
		*	depending on the available optional modules and parameters
		*/
		create:function(jQuery,_this){
			_this = _this;
			_this.$ = jQuery;
			_this.reflowLevel = 0;
			_this._boundaryWrap(_this.$el,_this);
			
			_this.$el.find(_this.selector).each(function(i) {
				if( HxdModuleLoader !== 0 ){
					_this.items[i] = HxdModuleLoader.moduleSelect( _this , _this.cellOptions, $(this) , HxdItem );
				}else{
					_this.items[i] =  new HxdItem( $(this) , _this.cellOptions); 
				}
				/* HardCoded version
				else if(hexModule && _this.hexMode){
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
				}*/
				
				_this.items[i]._id = _this._id + '@'+i;
				_this.items[i]._passNodeAttributes( $(this).get(0).attributes );//Used for sorting
			});
			
			if( _this.cellStyle == 0 ){
				var sK = 	_this.items.length > 1 ? 1: 0;
				if(sK == 0){
					console.log('OPS one item in the grid. Are you sure you have it on the right dom element');
				}
				_this.cellStyle =  css( _this.items[sK].$elem ); //Used in mapGrid
				if(( typeof _this.cellStyle.height === 'undefined') ){
					_this.cellStyle.height = _this.cellStyle.width;
				}
			}
			_this.xyMap = _this.mapGrid(),
			_this._prepContainer();
			_this.reflowHexRows();	
			
		 },
		_prepContainer:function() {
			pos = this.$el.position();
			boundingX = pos.left;
			boundingY = pos.top;
			boundingH = (this.xyMap.rows * parseInt(this.cellStyle.height) + (parseInt(
				this.cellStyle['margin-top']) || 0));
				
			this.$el.find('.gridContent')
				.height(boundingH)
				.width('100%'); 
		},
		 _boundaryWrap:function($elem , _this ) {
			_this= _this || this;
			out = $elem.wrapInner("<div class='gridContent'></div>");
			
			var event = "binaryShift"+_this._id;
			out.find('.gridContent').bind(event, function(e,data) {
				_this.orderSwap(data);
			});
		},
		orderSwap: function(items){
			var i1 = items[0].startPos,
				i2 = items[1].startPos;
			this.itemOrder[ i1 ]=i2;
			this.itemOrder[ i2 ]=i1;
		},
		/**
		*	reflowHexRows
		*	The following function is fired at the beginning and after resize events; 
		*	It updates the map object returned from mapGrid() and checks if the items need to be moved
		* 	When there is a change in the amount of rows it calls reflowCells passing the current order of elements
		*/
		reflowHexRows:function(_callback) {
            if( reflowLock ) {
                reflowLock = false; //First check
                this.xyMap = this.mapGrid();
                if (this.reflowLevel != this.xyMap.rows) { //Second check
                    this._prepContainer();
                    reflowLevel = this.xyMap.rows;
					this.reflowCells( this.itemOrder );
                }
                reflowLock = true;
				
				if (typeof  _callback!== 'undefined'){
					_callback();
				}
            } 
        },
		/**
		* 	reflowCells
		* 	This is responsible for the shifting coordinates and animation of the moving components 
		*	On the first iteration this function also stores the index position of the elements and starting order
		*	
		*	The cells are positioned based on the output of mapGrid() 
		*
		*/
		reflowCells: function( itemOrder ) {
			var _this = this;
			
			if(( typeof _this.itemOrder === 'undefined') ){
				_this.itemOrder=[];
			}
			for( i = 0;i < _this.items.length; i++ ){//iterates over
				var k =  ( ( typeof itemOrder === 'undefined') || ( typeof itemOrder[i] === 'undefined') ) ? i : itemOrder[i] ; //  itemOrder[i]) || i;
				
				if( typeof  _this.xyMap.cols!== 'undefined' || _this.xyMap.cols != 0 ){
					if( 0 < _this.hiddenItems.indexOf(k)){
							_this.items[k].toggleVisible();
						}else{
							_this.items[k].forceVisible();
						}
						
					var row = Math.ceil((i + 1) / _this.xyMap.cols),
						tCol = ( (i) % _this.xyMap.cols ),
						xCor = (tCol) * _this.xyMap.xO + _this.xyMap.xIndent;
						if( !isNaN(tCol) ) 
							var yCor = _this.xyMap.yO[tCol % 2] (row - 1);// <-- calls a function
						_this.items[k].moveTo(xCor,yCor);
				}
				_this.items[k].startPos = k;
				_this.itemOrder[i] =  k;
			}
			console.log(_this.hiddenItems);
        },
		grepItems: function(key,val){
			return $.grep(this.items, function (hxI)
			{
				if (typeof  val!== 'undefined'){
					return hxI[key] === val;
				}else{
					return hxI[key];
				}
			});
		},
		orderByDateKey: function( key, hideOthers ,order, splitter, dateFormat ){
			var order 			= order || 'ascending';
			var splitter 		= splitter || '.';
			var dateFormat 		= dateFormat || 'DD-MM-YYYY';
			var hideOthers = hideOthers || false;
			var set = this.grepItems(key).
										sort(function(a, b){
											var aDate = Date.parse( hxDateFormat(  a[key] , splitter , dateFormat ) );
											var bDate = Date.parse( hxDateFormat(  b[key] , splitter , dateFormat ) );
											if( order=='descending' )
												return aDate < bDate ;
											else
												return aDate > bDate ;
										});
			var ordered = [];
			var hidden = [];
			for( i = 0; i < set.length; i++ ){
				ordered[i] = set[i].startPos;
			}
			for( i = 0; i < this.itemOrder.length; i++ ){
				if(  ordered.indexOf(i) !=-1){}
				else{
					ordered.push(i);
					if( hideOthers ){
						hidden.push(i);
					}
				}
			}
			if( hideOthers )
				this.hiddenItems = hidden ;
			
			this.itemOrder = ordered ;
			this.reflowCells(this.itemOrder);
		},
		orderByKey: function( key, hideOthers, order ){
			var order 			= order || 'ascending';
			var hideOthers 		= hideOthers || false;
			var set = this.grepItems(key).
										sort(function(a, b){
											if( order=='descending' ){
												return a[key] < b[key];
											}else{
												return a[key] > b[key];
											}
										});
			var ordered = [];
			var hidden = [];
			for( i = 0; i < set.length; i++ ){
				ordered[i] = set[i].startPos;
			}
			for( i = 0; i < this.itemOrder.length; i++ ){
				if(  ordered.indexOf(i) !=-1){}
				else{
					ordered.push(i);
					if( hideOthers ){
						hidden.push(i);
					}
				}
			}
			if( hideOthers )
				this.hiddenItems = hidden ;
			this.itemOrder = ordered ;
			this.reflowCells(this.itemOrder);
		},
		randomShuffle: function(){
			 var io = this.itemOrder;
			 for (var i = io.length - 1; i > 0; i--) {
				var j = Math.floor( Math.random() * (i + 1) );
				var temp = io[i];
				io[i] = io[j];
				io[j] = temp;
			}
			this.reflowCells(io);
		},
		resetOrder: function(){
			for( i = 0; i < this.itemOrder.length; i++ ){
				this.itemOrder[i]=i;
			}
			this.hiddenItems = [];
			this.reflowCells(this.itemOrder);
		},
		/**
		*	Core mapping function
		*	Based on the dimensions of the hxd items and the container, 
		*	this function returns the variables needed for placing the items in their appropriate position.
		*	Output is an object containing the total columns, rows and coordinate offsets; 
		*	Additional output includes xIndent which is used to center the blocks based on remaining space if the cells do not fit
		*
		**/
		mapGrid: function() {
			var cont = this.$el;
			var h = cont.height(),
				w = cont.width();
			var items = this.items.length//(cont.find(this.selector)).length;
			
			var mrgL = parseInt(this.cellStyle['margin-left'] || 0);
			var xOffset = parseInt(this.cellStyle.width) + ( mrgL );
			var cols = Math.floor(w / xOffset);
			
			var xInd = (w - ((cols) * xOffset) ) / 2;
			
			if( xInd > Math.abs(mrgL) * 2 )
				xInd -= ( mrgL );
			else{
				xInd +=( mrgL / 2 );
			}
			if( items < cols ){ // Fix for 1 row grids
				xInd = xInd +(xOffset * ( ( cols-items )/2 ) );
			}
			
			return {
				cols: cols,
				rows: Math.ceil(items / cols),
				xO: xOffset,
				yO: this.items[this.items.length > 1 ? 1: 0].hxGetYOffset(this.cellStyle),
				xIndent: xInd //get the the remainder value to center the other blocks
			};
		}
	}
	
	function delayedOpacityShift( elem, op,delay, xCor, yCor ) {
		var delay = typeof delay==='undefined' ? 1000 : delay;
		setTimeout(function () {
			var xPx = xCor+'px';
			var yPx = yCor+'px';
			elem.style.left = xPx;
			elem.style.top  = yPx
			elem.style.opacity = "1";
		}, delay);
	}
	
	function whichTransitionEvent(){
		var t;
		var el = document.createElement('fakeelement');
		var transitions = {
		  'transition':'transitionend',
		  'OTransition':'oTransitionEnd',
		  'MozTransition':'transitionend',
		  'WebkitTransition':'webkitTransitionEnd'
		}

		for(t in transitions){
			if( el.style[t] !== undefined ){
				return transitions[t];
			}
		}
	}
    jQuery.fn.hxdGrid = function(options) {
		var hxdGrids=[];
		hxAttachWindowFunctions(hxdGrids);
		return this.each( function(i) {
			var $el = $( this );
			hxdGrids[i] = new HxdGrid($, $el, options);
		})
	}
	
	function hxAttachWindowFunctions(hxdGrids){
		window.getHxGridObj = function (id){
			return hxdGrids[id];
		}
		window.getHxItemById = function (id){
			var ids = id.split("@");
			var grid  = hxdGrids[ parseInt(ids[1]) ];
			if( typeof grid === 'undefined'  ){
				console.error('Hexdgrid:Access error. Invalid grid id. Grid_ID:'+ids[1]+'  RAW'+id)
				return 0;
			}
			var item = grid.items[ parseInt(ids[0]) ];
			if(  typeof item === 'undefined' ) {
				console.error('Hexdgrid:Access error. Invalid item id. Item_ID: '+ids[0]+' RAW:'+id)
				return 0;
			}
			return hxdGrids[ parseInt(ids[1]) ]
					.items[ parseInt(ids[0]) ];
		}
	}
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
	
	/* General purpose functions */
	function validHex(inp){
		return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(inp));
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
	function merge(a, b, c) {
		c = c || [];
		if(!a.length && !b.length) return c;

		c.push(a[0] < b[0] || isNaN(b[0]) ? a.shift() : b.shift());
		return merge(a, b, c);
	}

	function msort(inp) {
		var mid = (inp.length / 2) << 0;
		if(!mid) return inp;
		
		return merge(
			msort(inp.slice(0, mid)),
			msort(inp.slice(mid)));
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
	function hxDateFormat(str,separator,format){
		var formatOrder = {'MM':0,'YYYY':2 , 'DD':1};
		var out =[];
		var strArr 		= str.split(separator);
		var formatArr 	= format.split('-');
		for(var i = 0 ; i < formatArr.length ; i++  ){
			//console.log('format '+formatOrder[formatArr[i]]);
			//console.log('date '+strArr[i]);
			out[formatOrder[formatArr[i]]] = strArr[i];
		}
		//console.log(out.join(" "));
		return out.join(" ");
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
})(jQuery);

