# hxdGrid 
This is a variant of the original script which implements a different positioning method. The new implementation allows for elements that have different dimensions to be ordered in the layout. At this stage it is a roughly hacked approach and needs refining. 


## Overview
What this new implementation does is that it creates an adjustable coordinate grid, based on which the dom elements are positionsed. It works ideally with blocks that are proportional to the grid cell size. 

For example given a container with dimensions 1300 x 600, and a cell size of 50px there would be 26x12 cells at the start. 

The elements are scaled(if needed) and placed based on how many cells they take up. 50x50 takes one cell, a 100 x 50 px div takes two cells horizonally and 1 cell vertically, etc. 

Elements that do not fit exactly are scaled up or down. 40 x 60 px is scaled to 50x50, 320 x 190 becomes 300x200 and so on  



## Other Changes 
1. Removed plain javascript animations. At a later stage there will be a shim script for IE9 (and other uncompatible browser) support
2. Sorting has been removed. It will be reimplemented at a later stage.
3. Addon modules have been removed
4. Overall code cleanup(still in progress).A lot of the unneccesary functions have been removed



### Version
0.3.0 (alpha)

License
----

GPLv3

   
   [jQuery]: <http://jquery.com>
   [clip-path-polygon]: <https://github.com/andrusieczko/clip-path-polygon>
  