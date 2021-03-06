# hxdGrid 

HxdGrid is a front end script for ordering and sorting elements in a responsive grid layout. The implementation is object based and allows easy customization of the appearance, animation and style of the div elements.

  - Several packaged variations for div layouts including a hexagon grid
  - Easy to use data-tag sorting
  - CSS transitions or jQuery for reordering and sorting animations.


### Version
0.2.5

### Browser compatibility
The script works on Firefox, Chrome, Safari and IE9. While it may work on older IE versions it may need some tweaking.


 

# Usage and Setup 
#### Also available at http://fr0stb1t3.github.io/hxdgrid/

You need to run the script from a server. To get a basic barebones version going you need the base script
```html
<script src="js/hxdgrid.js" type="text/javascript"></script>
```

#### 1. The first step is to have a html container element and items that you want to sort
```html
<div class="hxOuter">
    <div class="hxdItem">testbox</div>
	<div class="hxdItem">testbox</div>
	<div class="hxdItem">testbox</div>
	<div class="hxdItem">testbox</div>
</div>
```
#### 2. Next we need a simple style for the boxes
```style
.hxdItem {
  width: 200px;
  overflow: hidden;
  height: 200px;
  background: #AAA;
  margin-left: 4px;
  margin-bottom: 4px;
}
```
#### 3. Finally we launch the script with a jquery function
```javascript
//Either with plain javascript
document.addEventListener("DOMContentLoaded", function() {
		var options  = {
			selector:  '.hxdItem'//default selector
		};
		hxdgrid( '.hxOuter' , options );
});
//Or with  jQuery
$(function() {
	var options  = {
		selector:  '.hxdItem'//default selector
	};
	$('.hxOuter').hxdGrid(options);
});
```

### Extended Setup
#### Sorting
To get the sorting running you  need to add some data tags
#### 1 Add some data tags
The script targets data tags that start with data-hxd and should ingore others.
```html
<div class="hxOuter">
	<div class="hxdItem">Unordered box</div>
	<div class="hxdItem">Unordered box</div>
	<div class="hxdItem">Unordered box</div>
	<div class="hxdItem">Unordered box</div>
	<div class="hxdItem" data-hxd-letter="c">Third Box  (letter sort) </div>
	<div class="hxdItem" data-hxd-letter="d">Fourth Box (letter sort) </div>
	<div class="hxdItem" data-hxd-letter="b">Second Box (letter sort) </div>
	<div class="hxdItem" data-hxd-letter="a">First Box  (letter sort) </div>
	<div class="hxdItem">Unordered box</div>
	<div class="hxdItem">Unordered box</div>
	<div class="hxdItem">Unordered box</div>
	<div class="hxdItem">Unordered box</div>
	<div class="hxdItem" data-hxd-date="30.10.2015">Fourth Box (date sort) </div>
	<div class="hxdItem" data-hxd-date="25.10.2015">Second Box (date sort) </div>
	<div class="hxdItem" data-hxd-date="24.10.2015">First Box  (date sort) </div>
	<div class="hxdItem" data-hxd-date="29.10.2015">Third Box  (date sort) </div>
</div>
<button id="dateSort">Sort by date</button>
<button id="letterSort">Sort by letter</button>
<button id="resetOrder">Reset Order</button>
```
#### 2 Get the hxGrid object and bind the order event

```javascript
document.addEventListener("DOMContentLoaded", function() {
		var options  = {
			selector:  '.hxdItem'//default selector
		};
		hxdgrid( '#hxOuter' , options );
		var demoGrid = getHxGridObj(0); // Get the correct grid container object
	
		var btn1 = document.querySelector("#letterSort");
		btn1.addEventListener('click', function(event) {
			demoGrid.orderByKey('letter' , true , 'ascending' );
		});
		
		var btn2 = document.querySelector("#dateSort");
		btn2.addEventListener('click', function(event) {
			demoGrid.orderByDateKey('date' , false , 'ascending' );
		});
		
		var btn3 = document.querySelector("#resetOrder");
		btn3.addEventListener('click', function(event) {
			demoGrid.resetOrder();
		});
	});
//Or with jQuery
$(function() {
	var options  = {
		selector:  '.hxdItem'//default selector
	};
	$('.hxOuter').hxdGrid(options);
	var demoGrid = getHxGridObj(0); // Get the correct grid container object
	$('#dateSort').click(function(){
	    demoGrid.orderByKey('date');
	});
	$('#letterSort').click(function(){
		demoGrid.orderByKey('letter');
	});
	$('#resetOrder').click(function(){
		demoGrid.resetOrder();
	});
});

```
### Development

See a bug that needs fixing or an ugly bit of code that really needs a cleanup. Let me know at antoni.hxd@gmail.com

### Additional extension requirements

Since the earlier versions used jQuery it is still needed for some old extra settings (after including the loader file) If you just need the core script, these do not apply

* [clip-path-polygon] for the hex clip/image clip module
* [jQuery] -At least 1.6.0 

### Todos

 - Debugging. Still has some issues
 - Testing.Browser support 
 - Documentation for usage and development
 - Module autoloading

License
----

GPLv3

   
   [jQuery]: <http://jquery.com>
   [clip-path-polygon]: <https://github.com/andrusieczko/clip-path-polygon>
  