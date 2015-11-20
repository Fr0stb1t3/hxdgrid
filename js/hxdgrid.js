/**
    HxdGrid 0.2.5
    HxdGrid is a front end script for ordering and sorting elements in a responsive grid layout.
    Copyright (c) 2015 Antoni Atanasov
    License:  The current version project is licensed under GPLv3 at a later stage this may change to a dual license
    For more information check the Readme
    Project site: Coming Soon
    Github site:
**/

var jQuery = jQuery || (require && require('jquery'));
var HxdModuleLoader = typeof HxdModuleLoader === 'undefined' ? 0 : HxdModuleLoader;
(function($) {
    "use strict";
    var gridIdCounter = 0;
    var HxdGrid = function( domElem, options) {
        try {
            var _this = this;
            _this.uid = gridIdCounter;
            _this.domElem = domElem;
            _this.resizeLock = true;
            _this.items = [];
            if( msieversion() ){
                 domElem.className +='hxdGridContainer';// IE AGAIN...
            }else{
                domElem.classList.add('hxdGridContainer');
            }
            domElem.setAttribute("style", "list-style: none;width: 100%; height: 100%; overflow: hidden;  position: relative;");

            _this.setOptions(options);
            _this.create(jQuery, _this);
            hxResizeBind(_this);
            gridIdCounter++;
        } catch (e) {
            throw new HxdException('HxdGrid-> Grid initialization error. Detais: ' + e);
        }
    };
    /* Core item object and prototype */
    var HxdItem = function(jqElem, cellOptions) {
        this.jqElem = $(jqElem);
        this.domElem = jqElem;
        this.cssAnim = true;
        if (msieversion()) { //IE FIX disable CSS animations
            //HxdWarning('CSS animations not supported with IE. Auto fallback to javascript');
            this.cssAnim = false;
        }
        //this.harwareAccelaration = false; //Triggers the hardware acceleration css
        this.setOptions(cellOptions);
        this.create(this);
    };
    HxdItem.prototype = {
            /* Base prototype. All the properties and methods in this object are shared between other variations */
            uid: 0,
            jqElem: null,
            domElem: null,
            startPos: null,
            bgColor: 0,
            harwareAccelaration: false,
            xCor: 0,
            yCor: 0,
            setOptions: function(options) {

                this.viewFade = (options && options.viewFade) || this.viewFade;
                this.autoBind = (options && options.autoBind) || this.autoBind;
                this.harwareAccelaration = (options && options.harwareAccelaration) || this.harwareAccelaration;

                if (typeof options.bgColor !== 'undefined' && options.bgColor != 0){
                    if (validHex(options.bgColor)) {
                        this.bgColor = (options && options.bgColor);
                    } else {
                        new HxdWarning('HxdError -> Options.Invalid color (' + options.bgColor + ') provided. Input ignored. Please provide a valid hex string');
                    }
                }
            },
            addAttr: function(key, value) {
                if (!this.hasOwnProperty(key)) {
                    this[key] = value;
                } else {
                    new HxdWarning('HxdError -> Object function. Attempting to override property. Use setAttribute instead');
                }
            },
            passNodeAttributes: function(nNodeMap) {
                for (var i = 0, len = nNodeMap.length; i < len; i++) {
                    var node = nNodeMap.item(i);
                    if ((node.name.indexOf("data-hxd-") > -1)) {
                        this.addAttr(node.name.replace('data-hxd-', ''), node.value );
                    }
                }
            },
            create: function(_this) {
                var styleOver = '';
                if (typeof css(_this.domElem)['background-color'] !== 'undefined') {
                    var styleCol = rgbToHexString( css( _this.domElem )['background-color'] );
                    if (validHex(styleCol)) {
                        _this.bgColor = styleCol;
                        styleOver = _this.colStyleOverride(_this);
                    }
                }
                var modeVar = '';
                vWrap(_this.domElem, "<div class='hxContent " + modeVar + "' " + styleOver + ">", "</div>" );

            },
            getXY: function() {
                return [this.xCor, this.yCor];
            },
            swapPos: function(hxItem2, _callback) {
                var hxItem1 = this;
                var me = hxItem1.getXY(),
                    it = hxItem2.getXY();

                hxItem1.moveTo(it[0], it[1]);
                hxItem2.moveTo(me[0], me[1]);
                var parentuid = (this.uid.split("@"))[0];
                this.jqElem.parent().trigger('binaryShift' + parentuid, {
                    0: hxItem1,
                    1: hxItem2
                });

                if (typeof _callback !== 'undefined') {
                    _callback();
                }
            },
            colStyleOverride: function(_this) {
                if (typeof _this.bgColor !== 'undefined' && _this.bgColor !== 0) {
                    return 'style="background:' + _this.bgColor + '"';
                }
            },
            moveTo: function(xCor, yCor, domElem) {
                var domElem =  domElem || this.domElem;
                //var xCor = xCor;
               // var yCor = yCor;
                if ((typeof domElem.getAttribute('style') !== 'undefined') && domElem.style.position == 'absolute') {
                    if (this.moveInViewport(xCor, yCor) || !this.viewFade) { //this.isElementInViewport()
                        this.animateOver(xCor, yCor);
                    } else {
                        if (this.cssAnim) {
                            this.fadeOver(xCor, yCor, domElem);
                        } else {
                            this.fadeOver(xCor, yCor, domElem);
                            /* TO DO
                            jqElem.filter(':not(:animated)').fadeOut('normal', function() {
                                jqElem.css({
                                    left: xCor,
                                    top: yCor
                                });
                                jqElem.fadeIn('fast');
                            });*/
                        }
                    }
                } else {
                    domElem.setAttribute('style', 'margin:0!important;float:none;position: absolute;left:' + xCor + 'px;top:' + yCor + 'px');
                }
                this.xCor = xCor;
                this.yCor = yCor;
            },
            animateOver: function(xCor, yCor, domElem) {
                var domElem = domElem || this.domElem;

                if (!this.cssAnim) {
                    if (domElem.style.top < yCor) {
                        vanillaAnimate(domElem,'left',domElem.style.left,xCor, 500);
                        vanillaAnimate(domElem,'top',domElem.style.top,yCor, 500);
                    } else {
                        vanillaAnimate(domElem,'left',domElem.style.left,xCor, 500);
                        vanillaAnimate(domElem,'top',domElem.style.top,yCor, 500);
                    }
                } else {
                    if (this.harwareAccelaration) {
                        domElem.style.WebkitTransform = "  translate3d(0, 0, 0)";
                        domElem.style.MozTransform = "  translate3d(0, 0, 0) "; // ease-out// ease
                        domElem.style.transform = " translate3d(0, 0, 0) ";
                    }
                    domElem.style.WebkitTransition = "  all 0.7s ease ";
                    domElem.style.MozTransition = "  all 0.7s ease "; // ease-out// ease
                    domElem.style.transition = " all 1s ease  ";
                    var xPx = xCor + 'px';
                    var yPx = yCor + 'px';
                    if (domElem.style.top < yCor) {
                        if (domElem.style.left != xPx){
                            domElem.style.left = xPx;
                        }

                        if (domElem.style.top != yPx){
                            delayedY(domElem, yPx, 1000);
                        }
                    } else {
                        if (domElem.style.top != yPx){
                            domElem.style.top = yPx;
                        }
                        if (domElem.style.left != xPx){
                            delayedX(domElem, xPx, 1000);
                        }
                    }
                }
            },
            fadeOver: function(xCor, yCor, elem) {
                var elem = elem || this.domElem; //
                elem.style.WebkitTransition = "  opacity  0.7s ease ";
                elem.style.MozTransition = "  opacity  0.7s ease ";
                elem.style.transition = " opacity  1 linear 0s ";
                elem.style.opacity = "0";
                this.delayedOpacityShift(elem, 2, 1500, xCor, yCor);
            },
            delayedOpacityShift: function(elem, op, delay, xCor, yCor) {
                var delay = typeof delay === 'undefined' ? 1000 : delay;
                setTimeout(function() {
                    var xPx = xCor + 'px';
                    var yPx = yCor + 'px';
                    elem.style.left = xPx;
                    elem.style.top = yPx;
                    elem.style.opacity = "1";
                }, delay);
            },
            forceHidden: function() { //IMPROVE
                this.jqElem.fadeOut("slow", "linear");
            },
            forceVisible: function() { //IMPROVE
                this.jqElem.fadeIn("slow", "linear");
            },
            toggleVisible: function(speed) {
                var speed = speed || 'slow';
                this.jqElem.fadeToggle("slow", "linear");
            },
            isElementInViewport: function(xCor, yCor) {
                var rect = this.domElem.getBoundingClientRect();
                var visOffset = 100;
                return (
                    rect.top >= (0 - visOffset) &&
                    rect.left >= (0 - visOffset) &&
                    rect.bottom <= ((window.innerHeight + visOffset) || (document.documentElement.clientHeight + visOffset)) &&
                    rect.right <= ((window.innerWidth + visOffset) || (document.documentElement.clientWidth + visOffset))
                 );
            },
            moveInViewport: function(xCor, yCor) {
                var rect = this.domElem.getBoundingClientRect();
                var visOffset = 0;
                var tO = parseInt(this.domElem.style.top) - yCor;
                var lO = parseInt(this.domElem.style.left) - xCor;
                return (
                    (rect.top - tO) >= (0 - visOffset) &&
                    (rect.left - lO) >= (0 - visOffset) &&
                    (rect.bottom - tO) <= ((window.innerHeight + visOffset) || (document.documentElement.clientHeight + visOffset)) &&
                    (rect.right - lO) <= ((window.innerWidth + visOffset) || (document.documentElement.clientWidth + visOffset))
                  );
            },
            hxGetYOffset: function(cellStyle) {
                var y1 = parseInt(cellStyle.height) * 1.015;
                return [
                    (function(i) {
                        return y1 * i;
                    }), (function(i) {
                        return (y1 * i) + (parseInt(
                            cellStyle['margin-top']) || 0);
                    })
                ];
            }
        }
        /* Core Grid prototype */
    HxdGrid.prototype = {
        uid: 0,
        domElem: null,
        resize: true,
        selector: '.hxdItem',
        hiddenItems: [],
        gridId: null,
        accelarationH: false,
        emptyGrid: false,
        emptyGridLength: 0,
        reflowLock: true,
        cellStyle: 0,
        cellOptions: {},
        setOptions: function(options) {

            /*container options */
            this.autocenter = (options && options.autocenter !== false) || false;
            this.clipping = (options && options.clipping) || this.clipping; // <-- At the moment only used in clip modules
            this.resize = (options && options.resize) || this.resize;
            this.selector = (options && options.selector) || this.selector;
            this.hexMode = (options && options.hexMode) || this.hexMode;
            this.reflowLock = (options && options.reflowLock) || this.reflowLock;
            this.emptyGrid = (options && options.emptyGrid) || this.emptyGrid;
            this.emptyGridLength = (options && options.emptyGridLength) || this.emptyGridLength;
            this.harwareAccelaration = (options && options.harwareAccelaration) || this.harwareAccelaration;

            /* Item options*/
            this.cellOptions.hxScale = (options && options.hxScale) || 'hxd-xl'; // <-- At the moment only used in some modules
            this.cellOptions.autoBind = (options && options.autoBind) || false;
            this.cellOptions.bgColor = (options && options.bgColor) || 0;
            this.cellOptions.viewFade = (options && options.viewFade) || false;
            this.cellOptions.harwareAccelaration = this.harwareAccelaration;
        },
        /**
         *    create
         *    Prepares the container object and identifies the hxdItem objects,
         *    depending on the available optional modules and parameters
         */
        create: function(jQuery, _this) {
            _this.reflowLevel = 0;
            _this._boundaryWrap( _this.domElem , _this);
                 var domArray = ( vClassFind( _this.domElem , _this.selector ) );
                 for(var i=0, len = domArray.length; i < len;i++ ){
                    if (HxdModuleLoader !== 0) { //If module loader is present use it to get the correct hxdItem object
                        _this.items[i] = HxdModuleLoader.moduleSelect(_this, _this.cellOptions, $(domArray[i]), HxdItem);
                    } else {
                        _this.items[i] = new HxdItem( domArray[i] , _this.cellOptions); //Use default item
                    }
                 _this.items[i].uid = _this.uid + '@' + i;
                 _this.items[i].passNodeAttributes( domArray[i].attributes ); //Used for sorting
            };

            if (_this.cellStyle == 0) {
                var sK = _this.items.length > 1 ? 1 : 0;
                if (sK == 0) {
                    throw new HxdException('OPS one item in the grid. Are you sure you have it on the right dom element');
                }
                _this.cellStyle = css( _this.items[sK].domElem ); //Used in mapGrid

                if ((typeof _this.cellStyle.height === 'undefined')) {
                    _this.cellStyle.height = _this.cellStyle.width;
                }
            }
            _this.xyMap = _this.mapGrid(),
                _this._prepContainer();
            _this.reflowHexRows();

        },
        _prepContainer: function() {
            var boundingH = (this.xyMap.rows * parseInt(this.cellStyle.height) + (parseInt(
                this.cellStyle['margin-top']) || 0));

             ( vClassFindOne( this.domElem, 'gridContent' ) ).setAttribute('style', 'position:relative;width:100%;height:' + boundingH + 'px');
        },
        _boundaryWrap: function(domElem, _this) {
            _this = _this || this;
            var out = vWrap( domElem, "<div class='gridContent'>", "</div>" )
            var event = "binaryShift" + _this.uid;
            ( vClassFindOne(out, 'gridContent' ) ).addEventListener(event, function(e, data) {
                _this.orderSwap(data);
            },false);
        },
        orderSwap: function(items) {
            var i1 = items[0].startPos,
                i2 = items[1].startPos;
            this.itemOrder[i1] = i2;
            this.itemOrder[i2] = i1;
        },
        /**
         *    reflowHexRows
         *    The following function is fired at the beginning and after resize events;
         *    It updates the map object returned from mapGrid() and checks if the items need to be moved
         *     When there is a change in the amount of rows it calls reflowCells passing the current order of elements
         */
        reflowHexRows: function(_callback) {
            if ( this.reflowLock ) {
                this.reflowLock = false; //First check
                this.xyMap = this.mapGrid();
                if (this.reflowLevel != this.xyMap.rows) { //Second check
                    this._prepContainer();
                    this.reflowLevel = this.xyMap.rows;
                    this.reflowCells(this.itemOrder);
                }
                this.reflowLock = true;

                if (typeof _callback !== 'undefined') {
                    _callback();
                }
            }
        },
        /**
         *     reflowCells
         *     This is responsible for the shifting coordinates and animation of the moving components
         *    On the first iteration this function also stores the index position of the elements and starting order
         *
         *    The cells are positioned based on the output of mapGrid()
         *
         */
        reflowCells: function(itemOrder) {
            var _this = this;

            if ((typeof _this.itemOrder === 'undefined')) {
                _this.itemOrder = [];
            }
            for (var i = 0, len = _this.items.length; i < len; i++) {
                var k = ((typeof itemOrder === 'undefined') || (typeof itemOrder[i] === 'undefined')) ? i : itemOrder[i]; //  itemOrder[i]) || i;

                if (typeof _this.xyMap.cols !== 'undefined' || _this.xyMap.cols !== 0) {
                    if (0 < _this.hiddenItems.indexOf(k)) {
                        _this.items[k].toggleVisible();
                    } else {
                        _this.items[k].forceVisible();
                    }
                    if (_this.emptyGrid == true) { //used for bigger grids with less elements and custom coordinates
                        var row = _this.items[k].setrow,
                            tCol = _this.items[k].setcol % _this.xyMap.cols; //( (i) % _this.xyMap.cols ),
                    } else {
                        var row = Math.ceil((i + 1) / _this.xyMap.cols),
                            tCol = ((i) % _this.xyMap.cols);
                    }
                    var xCor = (tCol) * _this.xyMap.xO + _this.xyMap.xIndent;
                    if (!isNaN(tCol))
                        var yCor = _this.xyMap.yO[tCol % 2](row - 1); // <-- calls a function

                    if ((typeof tCol === 'undefined') || (typeof yCor === 'undefined')) {
                        _this.items[k].forceHidden();
                    }

                    _this.items[k].moveTo(xCor, yCor);
                }
                _this.items[k].startPos = k;
                _this.itemOrder[i] = k;
            }

        },
        grepItems: function(key, val) {
            var cond = function(hxI) {
                if (typeof val !== 'undefined') {
                    return hxI[key] === val;
                } else {
                    return hxI[key];
                }
            };
            return vGrep(this.items, cond);
        },
        orderByDateKey: function(key, hideOthers, order, splitter, dateFormat) {
            var hideOthers = hideOthers || false,
                order = order || 'ascending',
                splitter = splitter || '.',
                dateFormat = dateFormat || 'DD-MM-YYYY',
                set = vSort(this.grepItems(key), key);
            var typeShift = function(t){ return Date.parse( hxDateFormat(  t, splitter , dateFormat ) )  }; //Function to adjust comparison for date objects

            if (order == 'descending') {
                var set = vSort(this.grepItems(key), key, 1, typeShift);
            } else {
                var set = vSort(this.grepItems(key), key, 0 ,typeShift);
            }

            this._orderChange(set, hideOthers);
        },
        orderByKey: function(key, hideOthers, order) {
            var hideOthers = hideOthers || false;
            var order = order || 'ascending';

            if (order == 'descending') {
                var set = vSort(this.grepItems(key), key, 1);
            } else {
                var set = vSort(this.grepItems(key), key);
            }
            this._orderChange(set, hideOthers);
        },
        _orderChange: function(set, hideOthers) {
            var ordered = [];
            var hidden = [];
            for (var i = 0, len = set.length; i < len; i++) {
                ordered[i] = set[i].startPos;
            }
            for (var i = 0, len = this.itemOrder.length; i < len; i++) {
                if (ordered.indexOf(i) != -1) {} else {
                    ordered.push(i);
                    if (hideOthers) {
                        hidden.push(i);
                    }
                }
            }
            if (hideOthers)
                this.hiddenItems = hidden;
            this.itemOrder = ordered;
            this.reflowCells(this.itemOrder);
        },
        randomShuffle: function() {
            var io = this.itemOrder;
            for (var i = io.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = io[i];
                io[i] = io[j];
                io[j] = temp;
            }
            this.reflowCells(io);
        },
        resetOrder: function() {
            for (var i = 0, len = this.itemOrder.length; i < len; i++) {
                this.itemOrder[i] = i;
            }
            this.hiddenItems = [];
            this.reflowCells(this.itemOrder);
        },
        /**
         *    Core mapping function
         *    Based on the dimensions of the hxd items and the container,
         *    this function returns the variables needed for placing the items in their appropriate position.
         *    Output is an object containing the total columns, rows and coordinate offsets;
         *    Additional output includes xIndent which is used to center the blocks based on remaining space if the cells do not fit
         *
         **/
        mapGrid: function() {
            var cont = this.domElem;
            var h = cont.offsetHeight,
                w = cont.offsetWidth;
            if (this.emptyGrid && this.emptyGridLength > 0) {
                var items = this.emptyGridLength
            } else {
                var items = this.items.length //(cont.find(this.selector)).length;
            }
            var mrgL = parseInt( this.cellStyle['margin-left'] || 0),
                mrgR = parseInt( this.cellStyle['margin-right'] || 0);

            var xOffset = parseInt(this.cellStyle.width) + (mrgL); //+ ( mrgR );
            var cols = Math.floor(w / xOffset);

            if (this.autocenter) {
                var xInd = (w - ((cols) * xOffset)) / 2;

                if (xInd > Math.abs(mrgL) * 2)
                    xInd -= (mrgL);
                else {
                    xInd += (mrgL / 2);
                }
                if (items < cols) { // Fix for 1 row grids
                    xInd = xInd + (xOffset * ((cols - items) / 2));
                }
            } else {
                var xInd = 0;
            }

            return {
                cols: cols,
                rows: Math.ceil(items / cols),
                xO: xOffset,
                yO: this.items[this.items.length > 1 ? 1 : 0].hxGetYOffset(this.cellStyle),
                xIndent: xInd //get the the remainder value to center the other blocks
            };
        }
    }
    function whichTransitionEvent() {
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        }

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }
    /* Function window bindings*/
    jQuery.fn.hxdGrid = function(options) {
        var hxdGrids = [];
        hxAttachWindowFunctions(hxdGrids);
        return this.each(function(i) {
            hxdGrids[i] = new HxdGrid(this, options);
        })
    }
    window.hxdgrid = function(target, options){
        var hxdGrids = [];
        hxAttachWindowFunctions(hxdGrids);
        var nodeList = document.querySelectorAll(target);
        for(var i=0, len = nodeList.length; i < len;i++ ){
            hxdGrids[i] = new HxdGrid(nodeList[i], options);
        }
        return hxdGrids[i];
    }
    function hxAttachWindowFunctions(hxdGrids) {
            window.getHxGridObj = function(id) {
                return hxdGrids[id];
            }
            window.getHxItemById = function(id) {
                try {
                    var ids = id.split("@");
                    var grid = hxdGrids[parseInt(ids[1])];
                    var item = grid.items[parseInt(ids[0])];
                    if (typeof item === 'undefined') {
                        new HxdWarning('HxdGrid->Access error. Invalid item id. Itemuid: ' + ids[0] + ' RAW:' + id)
                        return 0;
                    }
                    return hxdGrids[parseInt(ids[1])]
                        .items[parseInt(ids[0])];
                } catch (e) {
                    throw new HxdException( 'HxdGrid->Access error. Invalid ID format. The correct format is ITEMuid@GRIDuid. Current input ' + id + '. Exception details ' + e );
                }
            }
        }
    /* General purpose functions */
    function hxResizeBind(_this) {
        var rtime,
            timeout = false,
            delta = 200;

        function resizeEnd() {
            if (new Date() - rtime < delta) {
                setTimeout(resizeEnd, delta);
            } else {
                timeout = false;
                if (_this.resizeLock) {
                    _this.resizeLock = false;
                    _this.reflowHexRows(function() {
                        _this.resizeLock = true;
                    });
                }
            }
        }
        window.addEventListener('resize', function(event) {
            rtime = new Date();
            if (timeout === false) {
                timeout = true;
                setTimeout(resizeEnd, delta);
            }
        });
    }

    function validHex(inp) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(inp);
    }

    function rgbToHexString(string) {
        if (string == 'transparent') {
            return '';
        };
        var RGB = string.split("(")[1].split(")")[0].split(",");
        return rgbToHex(RGB[0], RGB[1], RGB[2]);
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function componentToHex(c) {
        c = parseInt(c);
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    function vClassFind( el, className ){
        var nodeList = el.querySelectorAll(className);
        return nodeList;
    }
    function vClassFindOne( el, className ){
        var notes;
       for (var i = 0, il = el.childNodes.length; i < il; i++) {
            var classes = el.childNodes[i].className != undefined? el.childNodes[i].className.split(" ") : [];
            for (var j = 0, jl = classes.length; j < jl; j++) {
                if (classes[j] == className) notes = el.childNodes[i];
            }
        }
        return notes;
    }
    function vanillaAnimate(elem,style,start,end,time) {
        var unit = 'px';
        var start = parseInt(start);
        var end = parseInt(end);
        if( !elem) return;
        var startT = new Date().getTime(),
            timer = setInterval(function() {
                var step = Math.min(1,( new Date().getTime()-startT)/time );
                var loc =  ( start+step*(end-start) )+unit;
                elem.style[style] = loc;
                if( step == 1) clearInterval(timer);
            },25);
        elem.style[style] = start+unit;
    }
    function vSort( objArry, key, oSwitch ,typeShift ) {
        //oSwitch designates the collection order
        var typeShift = typeShift || function(t){return t};
        var oSwitch = oSwitch || 0;
        var collections = [];
        collections[0] = [];
        collections[1] = [];

        if (objArry.length < 2) {
            return objArry;
        }

        var pivot = Math.floor(objArry.length / 2);
        var pivotVal = typeShift( objArry[pivot][key] );
        var pivotItem = objArry.splice(pivot, 1)[0];

        for (var i = 0; i < objArry.length; i++) {
            var point = typeShift( objArry[i][key] );
            if (point <= pivotVal) {
                collections[0 + oSwitch].push(objArry[i]);
            } else if (point > pivotVal) {
                collections[1 - oSwitch].push(objArry[i]);
            }
        }

        return vSort(collections[0], key, oSwitch,typeShift).concat(pivotItem, vSort(collections[1], key, oSwitch,typeShift));
    }

    function css(a) { //Improved Version. Gets the computed style for the properties which may affect the grid object
        //Current Input jquery object. Future change would be for the function will not use the dom object directly
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
            'margin-bottom'
        ]; //relevant properties
        return getStyleProperties(a, propArr);

    }

    function getStyleProperties(el, propArr) {
        var outJSON = {},
            cS = getComputedStyle !== 'undefined';
        for (var i = 0, len = propArr.length; i < len; i++) {
            if (cS) {
                outJSON[propArr[i]] = getComputedStyle(el, null).getPropertyValue(propArr[i]); //;
            } else {
                outJSON[propArr[i]] = el.currentStyle[propArr[i]];
            }
        }
        return outJSON;
    }

    function getStyleProperty(el, prop) {
        if (getComputedStyle !== 'undefined') {
            return getComputedStyle(el, null).getPropertyValue(prop); //;
        } else {
            return el.currentStyle[prop];
        }
    }

    function hxDateFormat(str, separator, format) {
        var formatOrder = {
            'MM': 0,
            'YYYY': 2,
            'DD': 1
        };
        var out = [];
        var strArr = str.split(separator);
        var formatArr = format.split('-');
        for (var i = 0, len = formatArr.length; i < len; i++) {
            out[formatOrder[formatArr[i]]] = strArr[i];
        }
        return out.join("/");
    }

    function msieversion() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
            return true;
        else
            return false;
    }
    

    function vGrep(items, callback) {
        var filtered = [],
            len = items.length,
            i = 0;
        for (; i < len; i++) {
            var item = items[i];
            var cond = callback(item);
            if (cond) {
                filtered.push(item);
            }
        }
        return filtered;
    }

    function delayedY(elem, top, delay) {
        var delay = typeof delay === 'undefined' ? 1000 : delay;
        setTimeout(function() {
            elem.style.top = top;
        }, delay);
    }

    function delayedX(elem, left, delay) {
        var delay = typeof delay === 'undefined' ? 1000 : delay;
        setTimeout(function() {
            elem.style.left = left;
        }, delay);
    }
    function vWrap(orgDom, open, close ){
        var org_html = orgDom.innerHTML;
        var new_html = open + org_html + close;
        orgDom.innerHTML = new_html;
        return orgDom;
    }

    function HxdException(message) {
        this.message = message;
        this.name = "HxdException";
    }
    HxdException.prototype = new Error;

    function HxdWarning(text) {
        var methods = ["assert", "cd", "clear", "count", "countReset",
            "debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed",
            "groupEnd", "info", "log", "markTimeline", "profile", "profileEnd",
            "select", "table", "time", "timeEnd", "timeStamp", "timeline",
            "timelineEnd", "trace", "warn"
        ];
        var length = methods.length;
        var console = (window.console = window.console || {});
        var method;
        var noop = function() {};
        while (length--) {
            method = methods[length];
            if (!console[method])
                console[method] = noop;
        }
        //To do Disable for production, enable on debugging mode
        console.log("------WARNING------");
        console.log(text);
    }
})(jQuery);