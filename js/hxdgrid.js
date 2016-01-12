/**
    HxdGrid 0.3.0
    HxdGrid is a front end script for ordering and sorting elements in a responsive grid layout.
    Copyright (c) 2015 Antoni Atanasov
    License:  The current version project is licensed under GPLv3 at a later stage this may change to a dual license
    For more information check the Readme
    Project site: http://fr0stb1t3.github.io/hxdgrid/
    Github site: https://github.com/Fr0stb1t3
**/
(function() {
    "use strict";
    var gridIdCounter = 0;

    /* Core item object and prototype */
    var HxdItem = function(domElem, cellOptions, gridScale) {
        this.domElem = domElem;
        this.setOptions(cellOptions);
        this.create(this, gridScale);
    };
    HxdItem.prototype = {
            index: 0,
            domElem: null,
            xCor: 0,
            yCor: 0,
            gridPadding: 5,
            relW: 1,
            relH: 1,
            viewFade: true,
            setOptions: function(options) {
                this.viewFade = (options && options.viewFade) || this.viewFade;
                this.autoBind = (options && options.autoBind) || this.autoBind;

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
                        this.addAttr(node.name.replace('data-hxd-', ''), node.value);
                    }
                }
            },
            create: function(_this, scale) {
                _this.relW = Math.round(_this.domElem.offsetWidth / scale);
                _this.relH = Math.round(_this.domElem.offsetHeight / scale);

                if (_this.relW > 1) {
                    var pad = (_this.gridPadding / scale) * (_this.relW - 1); //IMPROVE THIS get rid of hacked padding stuff
                    _this.relW = (_this.relW) + pad;
                    _this.domElem.style.width = (_this.relW) * scale + 'px';
                }
                if (_this.relH > 1) {
                    var pad = (_this.gridPadding / scale) * (_this.relH - 1); //IMPROVE THIS get rid of hacked padding stuff
                    _this.relH = (_this.relH) + pad;
                    _this.domElem.style.height = (_this.relH) * scale + 'px';
                }
                //vWrap(_this.domElem, "<div class='hxContent'>", "</div>" );
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

                var target = (this.domElem.parentNode);
                var event = 'binaryShift' + parentuid;
                var data = {
                    0: hxItem1,
                    1: hxItem2
                };

                vTrigger(target, event, data);

                if (typeof _callback !== 'undefined') {
                    _callback();
                }
            },
            moveTo: function(xCor, yCor) {
                var domElem = this.domElem;
                if ((typeof domElem.getAttribute('style') !== 'undefined') && domElem.style.position == 'absolute') {
                    this.animateOver(xCor, yCor);
                } else {
                    var temp = domElem.getAttribute('style');
                    domElem.setAttribute('style', temp + 'opacity:1;margin:0!important;float:none;position: absolute;left:' + xCor + 'px;top:' + yCor + 'px');
                }
                this.xCor = xCor;
                this.yCor = yCor;
            },
            animateOver: function(xCor, yCor, domElem) {
                var domElem = domElem || this.domElem;

                //domElem.style.WebkitTransition = "  all 0.7s ease ";
                // domElem.style.MozTransition = "  all 0.7s ease "; // ease-out// ease
                //domElem.style.transition = " all 1s ease  ";
                var xPx = xCor + 'px';
                var yPx = yCor + 'px';
                if (domElem.style.top < yCor) {
                    if (domElem.style.left != xPx) {
                        domElem.style.left = xPx;
                    }
                    if (domElem.style.top != yPx) {
                        delayedSwitch(domElem, yPx, 'top', 1000);
                    }
                } else {
                    if (domElem.style.top != yPx) {
                        domElem.style.top = yPx;
                    }
                    if (domElem.style.left != xPx) {
                        delayedSwitch(domElem, xPx, 'left', 1000);
                    }
                }

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
            }
        }
        /* Core Grid prototype */
        //Possible reset
    var HxdMap = function() {


    };
    HxdMap.prototype = {

    };
    var HxdGrid = function(domElem, options) {
        try {
            this.uid = gridIdCounter;
            this.domElem = domElem;
            this.resizeLock = true;
            this.items = [];
            if (msieversion()) {
                domElem.className += 'hxdGridContainer';
            } else {
                domElem.classList.add('hxdGridContainer');
            }
            domElem.setAttribute("style", "list-style: none;width: 100%; height: 100%; overflow: hidden;  position: relative;");
            this.setOptions(options);
            this.create(this);
            hxResizeBind(this);
            gridIdCounter++;
        } catch (e) {
            throw new HxdException('HxdGrid-> Grid initialization error. Detais: ' + e);
        }
    };

    HxdGrid.prototype = {
        uid: 0,
        domElem: null,
        resize: true,
        gridCellSize: 80,
        gridCellsWidth: 0,
        gridPadding: 5,
        volume: 0,
        selector: '.hxdItem',
        hiddenItems: [],
        cellOptions: {},
        setOptions: function(options) {

            /*container options */
            this.autocenter = (options && options.autocenter !== false) || false;
            this.resize = (options && options.resize) || this.resize;
            this.selector = (options && options.selector) || this.selector;

            /* Item options*/
            this.cellOptions.autoBind = (options && options.autoBind) || false;
            this.cellOptions.viewFade = (options && options.viewFade) || false;
        },
        create: function(_this) {
            _this.reflowLevel = 0;
            _this._boundaryWrap(_this.domElem, _this);
            var domArray = (vClassFind(_this.domElem, _this.selector));
            for (var i = 0, len = domArray.length; i < len; i++) {
                domArray[i].innerHTML = i;
                _this.items[i] = new HxdItem(domArray[i], _this.cellOptions, _this.gridCellSize);
                _this.items[i].index = i;
                _this.volume += _this.items[i].relH + _this.items[i].relW;
                //_this.items[i].passNodeAttributes( domArray[i].attributes ); 
            };
            _this.positionItems();
        },
        _boundaryWrap: function(domElem, hxObj) {
            hxObj = hxObj || this;

            this.gridCellsWidth = Math.floor(domElem.offsetWidth / this.gridCellSize);

            var out = vWrap(domElem, "<div class='blockGrid' style='height: 100vh'>", "</div>");
            var event = document.createEvent("Event");
            event.initEvent("dataavailable", true, true);

            (vClassFindOne(out, 'blockGrid')).addEventListener(event, function(e, data) {
                //hxObj.orderSwap(data);
            }, false);
        },
        _calculateHeight: function() {
            var width = this.domElem.offsetWidth;
            var height = ((this.gridCellSize * this.gridCellSize) * this.volume) / width;
            this.domElem.style.height = height + "px";
            //console.log(Math.ceil(height));
        },
        resizeEvent: function() {
            console.log('resize');
            this.gridCellsWidth = Math.floor(this.domElem.offsetWidth / this.gridCellSize);
            this.positionItems();

        },
        positionItems: function() {
            var start = new Date().getTime();
            var xCor = 0,
                yCor = 0;
            var thisRow = {};
            var referenceObject = {};
            var firstrow = true;
            console.log('---------');
            for (var i = 0, len = this.items.length; i < len; i++) {
                // Still needs cleanup and probably an algorithm rewrite and simplification
                if (i > 0) {
                    xCor = this.gridPadding + (this.gridCellSize * this.items[i - 1].relW) + this.items[i - 1].xCor;
                    
                    if (xCor + (this.gridCellsWidth * this.items[i].relW) > (this.gridCellsWidth * this.gridCellSize)) {
                        xCor = 0;
                        firstrow = false;
                    }
                    if (!firstrow) {
                        var xy = xyCalibration(referenceObject, xCor, this,  i);
                        xCor = xy[0];
                        yCor = xy[1];
                        // To Do: Find next best fit
                        /*
                        if (checkNext(referenceObject, xCor, this, thisRow, i)) {
                            console.log('swap ' + i + ' with' + (i + 1));
                        }else{
                            console.log('last'+i);
                            console.log('last X '+xCor);
                            console.log('last Y '+yCor);
                        }
                         /**/
                    }
                } /**/
                this.items[i].moveTo(xCor, yCor);
                generateItemReference(referenceObject, this.items[i], (this.gridCellSize + this.gridPadding), i);

            }
            var end = new Date().getTime();
            var time = end - start;
            this._calculateHeight();
            this.items.sort(function(a, b) { //Restore order
                if (a.index < b.index) return -1;
                if (a.index > b.index) return 1;
                return 0;
            });
            console.log('Execution time: ' + time);
        }
    }
    
    function generateItemReference(refObject, item, offset, counter) {
        var w = Math.floor(item.relW);
        if (w > 1) {
            for (var k = 0; k < w; k++) {
                var xTemp = item.xCor + (k * (offset));
                refObject[xTemp] = {
                    relW: item.relW,
                    relH: item.relH,
                    yCor: item.yCor,
                    xCor: item.xCor,
                    i: counter
                }
            }
        } else {
            refObject[item.xCor] = {
                relW: item.relW,
                relH: item.relH,
                yCor: item.yCor,
                xCor: item.xCor,
                i: counter
            }
        }
    }
    
    function checkNext(referenceObject, refPointer, gridObject, thisRow, index) {
        var item = gridObject.items[index];
        if (typeof referenceObject[refPointer] !== 'undefined') {
            if (item.relW > 1) {
                for (var i = 1; i < item.relW; i++) {
                    var refPoint2 = referenceObject[refPointer].xCor + i * (gridObject.gridCellSize + gridObject.gridPadding);
                    if (typeof referenceObject[refPoint2] !== 'undefined' && referenceObject[refPoint2].relH >= 2) {
                        var next = index + 1;
                        while (true) { //swap with the smallest nearby item
                            if(typeof gridObject.items[next] === 'undefined'){
                                return false;
                            }
                            if (gridObject.items[next].relW == 1) {
                                gridObject.items[index] = gridObject.items[next];
                                gridObject.items[next] = item;
                                return true;
                            } else {
                                next++;
                            }
                        }
                    }
                }
            }
        }
    }/**/
    function generatePseudoReference(referenceObject, refPointer, gridObject, index) {
        var pseudoItem = clone(referenceObject[refPointer]);
        if (pseudoItem['relH'] > 2)
            pseudoItem['relH'] = pseudoItem['relH'] - 1;
        pseudoItem['yCor'] = pseudoItem['yCor'] + (gridObject.gridCellSize + gridObject.gridPadding);
        pseudoItem['i'] = 'pseudoB' + index;
        generateItemReference(referenceObject, pseudoItem, (gridObject.gridCellSize + gridObject.gridPadding), 'pseudoB');
    }

    function xyCalibration(referenceObject, refPointer, gridObject, index) {
        /* NEEDS IMPROVEMENT */
        var xCor = refPointer,
            yCor = 0;
        if (typeof referenceObject[refPointer] !== 'undefined') {
            if (referenceObject[refPointer]['relH'] >= 2) {
                generatePseudoReference( referenceObject, xCor, gridObject, index);
                xCor = gridObject.gridPadding + (gridObject.gridCellSize * referenceObject[refPointer].relW) + referenceObject[refPointer]['xCor'];
                while (typeof referenceObject[xCor] !== 'undefined' && referenceObject[xCor].relH > 2) {
                    var candidateBlock = referenceObject[xCor];
                    if (typeof candidateBlock === 'undefined') {
                        break;
                    } else {
                        xCor = candidateBlock.xCor + (candidateBlock.relW * gridObject.gridCellSize) + gridObject.gridPadding;
                    }
                }
                if (typeof referenceObject[xCor] !== 'undefined') refPointer = xCor;
            }
            yCor = referenceObject[refPointer]['yCor'] + gridObject.gridCellSize + gridObject.gridPadding;
            
        } else {
            console.log('Error This should not happen index:' + index +" : "+refPointer);
            yCor = -10000;
            //yCor = gridObject.items[index - 1].yCor;
        }
        return [xCor, yCor];
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
    if (typeof jQuery !== 'undefined') {
        jQuery.fn.hxdGrid = function(options) {
            var hxdGrids = [];
            hxAttachWindowFunctions(hxdGrids);
            return this.each(function(i) {
                hxdGrids[i] = new HxdGrid(this, options);
            })
        }
    };
    window.hxdgrid = function(target, options) {
        var hxdGrids = [];
        hxAttachWindowFunctions(hxdGrids);
        var nodeList = document.querySelectorAll(target);
        for (var i = 0, len = nodeList.length; i < len; i++) {
            hxdGrids[i] = new HxdGrid(nodeList[i], options);
        }
        if (len == 1) {
            return hxdGrids[0];
        }
        return hxdGrids;
    }

    function clone(obj) {
        if (obj == null || typeof(obj) != 'object')
            return obj;
        var temp = new obj.constructor();
        for (var key in obj)
            temp[key] = clone(obj[key]);
        return temp;
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
                throw new HxdException('HxdGrid->Access error. Invalid ID format. The correct format is ITEMuid@GRIDuid. Current input ' + id + '. Exception details ' + e);
            }
        }
    }
    /* General purpose functions */
    function hxResizeBind(gridObj) {
        var rtime,
            timeout = false,
            delta = 200;

        function resizeEnd() {
            if (new Date() - rtime < delta) {
                setTimeout(resizeEnd, delta);
            } else {
                timeout = false;
            }
            gridObj.resizeEvent();
        }
        window.addEventListener('resize', function(event) {
            rtime = new Date();
            if (timeout === false) {
                timeout = true;
                setTimeout(resizeEnd, delta);
            }
        });
    }

    function vClassFind(el, className) {
        return el.querySelectorAll(className);
    }

    function vClassFindOne(el, className) {
        var nodes;
        for (var i = 0, il = el.childNodes.length; i < il; i++) {
            var classes = el.childNodes[i].className != undefined ? el.childNodes[i].className.split(" ") : [];
            for (var j = 0, jl = classes.length; j < jl; j++) {
                if (classes[j] == className) nodes = el.childNodes[i];
            }
        }
        return nodes;
    }

    function vWrap(orgDom, openTag, closeTag) {
        var orgHtml = orgDom.innerHTML;
        var newHtml = openTag + orgHtml + closeTag;
        orgDom.innerHTML = newHtml;
        return orgDom;
    }

    function vTrigger(target, eventName, data) {
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("dataavailable", true, true, data);
        } else {
            event = document.createEventObject();
            event.eventType = "dataavailable";
        }

        event.eventName = eventName;
        if (document.createEvent) {
            target.dispatchEvent(event);
        } else {
            target.fireEvent("on" + event.eventType, event);
        }
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

    function msieversion() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
            return true;
        else
            return false;
    }

    function delayedSwitch(elem, top, sTag, delay) {
        var delay = typeof delay === 'undefined' ? 1000 : delay;
        setTimeout(function() {
            elem.style[sTag] = top;
        }, delay);
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
})();