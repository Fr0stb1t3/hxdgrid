var HxdModuleLoader="undefined"===typeof HxdModuleLoader?0:HxdModuleLoader;
(function(){function m(a){window.getHxGridObj=function(c){return a[c]};window.getHxItemById=function(c){try{var b=c.split("@");return"undefined"===typeof a[parseInt(b[1])].items[parseInt(b[0])]?(new h("HxdGrid->Access error. Invalid item id. Itemuid: "+b[0]+" RAW:"+c),0):a[parseInt(b[1])].items[parseInt(b[0])]}catch(d){throw new k("HxdGrid->Access error. Invalid ID format. The correct format is ITEMuid@GRIDuid. Current input "+c+". Exception details "+d);}}}function q(a){function c(){200>new Date-
b?setTimeout(c,200):d=!1;a.resizeEvent()}var b,d=!1;window.addEventListener("resize",function(a){b=new Date;!1===d&&(d=!0,setTimeout(c,200))})}function r(a,c){for(var b,d=0,e=a.childNodes.length;d<e;d++)for(var f=void 0!=a.childNodes[d].className?a.childNodes[d].className.split(" "):[],g=0,h=f.length;g<h;g++)f[g]==c&&(b=a.childNodes[d]);return b}function t(a,c,b){a.innerHTML=c+a.innerHTML+b;return a}function u(a,c,b){setTimeout(function(){a.style.top=c},"undefined"===typeof b?1E3:b)}function v(a,
c,b){setTimeout(function(){a.style.left=c},"undefined"===typeof b?1E3:b)}function k(a){this.message=a;this.name="HxdException"}function h(a){for(var c="assert cd clear count countReset debug dir dirxml error exception group groupCollapsed groupEnd info log markTimeline profile profileEnd select table time timeEnd timeStamp timeline timelineEnd trace warn".split(" "),b=c.length,d=window.console=window.console||{},e,f=function(){};b--;)e=c[b],d[e]||(d[e]=f);d.log("------WARNING------");d.log(a)}var n=
0,p=function(a,c,b){this.domElem=a;this.setOptions(c);this.create(this,b)};p.prototype={uid:0,domElem:null,startPos:null,bgColor:0,cssAnim:!0,xCor:0,yCor:0,baseWidth:80,gridPadding:5,relW:1,relH:1,viewFade:!0,setOptions:function(a){this.viewFade=a&&a.viewFade||this.viewFade;this.autoBind=a&&a.autoBind||this.autoBind;"undefined"!==typeof a.bgColor&&0!=a.bgColor&&(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a.bgColor)?this.bgColor=a&&a.bgColor:new h("HxdError -> Options.Invalid color ("+a.bgColor+") provided. Input ignored. Please provide a valid hex string"))},
addAttr:function(a,c){this.hasOwnProperty(a)?new h("HxdError -> Object function. Attempting to override property. Use setAttribute instead"):this[a]=c},passNodeAttributes:function(a){for(var c=0,b=a.length;c<b;c++){var d=a.item(c);-1<d.name.indexOf("data-hxd-")&&this.addAttr(d.name.replace("data-hxd-",""),d.value)}},create:function(a,c){a.relW=Math.round(a.domElem.offsetWidth/c);a.relH=Math.round(a.domElem.offsetHeight/c);if(1<a.relW){var b=a.gridPadding/80*(a.relW-1);a.relW+=b;b=a.relW*c+"px";a.domElem.style.width=
b}1<a.relH&&(b=a.gridPadding/80*(a.relH-1),a.relH+=b,b=a.relH*c+"px",a.domElem.style.height=b)},getXY:function(){return[this.xCor,this.yCor]},swapPos:function(a,c){var b=this.getXY(),d=a.getXY();this.moveTo(d[0],d[1]);a.moveTo(b[0],b[1]);var d=this.uid.split("@")[0],b=this.domElem.parentNode,d="binaryShift"+d,e={0:this,1:a},f;document.createEvent?(f=document.createEvent("HTMLEvents"),f.initEvent("dataavailable",!0,!0,e)):(f=document.createEventObject(),f.eventType="dataavailable");f.eventName=d;document.createEvent?
b.dispatchEvent(f):b.fireEvent("on"+f.eventType,f);"undefined"!==typeof c&&c()},moveTo:function(a,c){var b=this.domElem;if("undefined"!==typeof b.getAttribute("style")&&"absolute"==b.style.position)this.animateOver(a,c);else{var d=b.getAttribute("style");b.setAttribute("style",d+"opacity:1;margin:0!important;float:none;position: absolute;left:"+a+"px;top:"+c+"px")}this.xCor=a;this.yCor=c},animateOver:function(a,c,b){b=b||this.domElem;b.style.WebkitTransition="  all 0.7s ease ";b.style.MozTransition=
"  all 0.7s ease ";b.style.transition=" all 1s ease  ";a+="px";var d=c+"px";b.style.top<c?(b.style.left!=a&&(b.style.left=a),b.style.top!=d&&u(b,d,1E3)):(b.style.top!=d&&(b.style.top=d),b.style.left!=a&&v(b,a,1E3))},isElementInViewport:function(a,c){var b=this.domElem.getBoundingClientRect();return-100<=b.top&&-100<=b.left&&b.bottom<=(window.innerHeight+100||document.documentElement.clientHeight+100)&&b.right<=(window.innerWidth+100||document.documentElement.clientWidth+100)},moveInViewport:function(a,
c){var b=this.domElem.getBoundingClientRect(),d=parseInt(this.domElem.style.top)-c,e=parseInt(this.domElem.style.left)-a;return 0<=b.top-d&&0<=b.left-e&&b.bottom-d<=(window.innerHeight+0||document.documentElement.clientHeight+0)&&b.right-e<=(window.innerWidth+0||document.documentElement.clientWidth+0)}};var l=function(a,c){try{this.uid=n;this.domElem=a;this.resizeLock=!0;this.items=[];var b;b=0<window.navigator.userAgent.indexOf("MSIE ")||navigator.userAgent.match(/Trident.*rv\:11\./)?!0:!1;b?a.className+=
"hxdGridContainer":a.classList.add("hxdGridContainer");a.setAttribute("style","list-style: none;width: 100%; height: 100%; overflow: hidden;  position: relative;");this.setOptions(c);this.create(this);q(this);n++}catch(d){throw new k("HxdGrid-> Grid initialization error. Detais: "+d);}};l.prototype={uid:0,domElem:null,resize:!0,gridCellSize:80,gridCellsWidth:0,gridPadding:5,selector:".hxdItem",hiddenItems:[],cellOptions:{},setOptions:function(a){this.autocenter=a&&!1!==a.autocenter||!1;this.resize=
a&&a.resize||this.resize;this.selector=a&&a.selector||this.selector;this.cellOptions.autoBind=a&&a.autoBind||!1;this.cellOptions.bgColor=a&&a.bgColor||0;this.cellOptions.viewFade=a&&a.viewFade||!1},create:function(a){a.reflowLevel=0;a._boundaryWrap(a.domElem,a);for(var c=a.domElem.querySelectorAll(a.selector),b=0,d=c.length;b<d;b++)c[b].innerHTML=b,a.items[b]=new p(c[b],a.cellOptions,a.gridCellSize);a.positionItems()},_boundaryWrap:function(a,c){this.gridCellsWidth=Math.floor(a.offsetWidth/this.gridCellSize);
var b=t(a,"<div class='blockGrid' style='height: 100vh'>","</div>"),d=document.createEvent("Event");d.initEvent("dataavailable",!0,!0);r(b,"blockGrid").addEventListener(d,function(a,b){},!1)},resizeEvent:function(){console.log("resize");this.gridCellsWidth=Math.floor(this.domElem.offsetWidth/this.gridCellSize);this.positionItems()},positionItems:function(){var a=0,c=0,b=0,d={},e,f=0;console.log("");console.log("---------");for(var g=0,h=this.items.length;g<h;g++)"undefined"!==typeof e&&(f=a,c="undefined"!==
typeof e[f]?e[f].yCor+e[f].relH*this.gridCellSize+this.gridPadding:this.items[g-1].yCor),this.items[g].moveTo(a,c),d[a]={relW:this.items[g].relW,relH:this.items[g].relH,yCor:this.items[g].yCor,i:g},a=this.gridPadding+this.gridCellSize*this.items[g].relW+this.items[g].xCor,a>this.gridCellsWidth*this.gridCellSize?(b=a=0,e=d,Object.keys(d),d={}):b++}};"undefined"!==typeof jQuery&&(jQuery.fn.hxdGrid=function(a){var c=[];m(c);return this.each(function(b){c[b]=new l(this,a)})});window.hxdgrid=function(a,
c){var b=[];m(b);for(var d=document.querySelectorAll(a),e=0,f=d.length;e<f;e++)b[e]=new l(d[e],c);return 1==f?b[0]:b};k.prototype=Error()})();
