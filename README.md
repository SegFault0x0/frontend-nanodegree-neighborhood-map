# Neighborhood Map Project

This project utilizes the [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/reference) to display a map detailing points of
interest in a certain area. Clicking on any of the representative markers for
produces an Info Window with information about that point. That information is
provided by [Wikipedia's API](https://www.mediawiki.org/wiki/API:Main_page).

## Usage

1. Download or clone the [github project](http://github.com/SegFault0x0/frontend-nanodegree-neighborhood-map).
1. From an internet browser, open `.../frontend-nanodegree-neighborhood-map/index.html`.

## Features

### Markers/Locations
Locations are represented on the map by markers.  Clicking on a marker will open
a Google [Info Window](https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple) containing information about that point.

Clicking on an item in the list (located at the left of the screen) will render
the same results.

### Filtering
Click in the "Filter..." text box, start typing the name of one of the items in
the list, and watch the markers disappear!  Markers are dynamically filtered on
the map upon keypress compliments of the [KnockoutJS Javascript Framework] (http://knockoutjs.com/).

### Menu Visibility
Show or hide the list menu by clicking the *Hamburger Menu* icon at
the top-left.  This may come in handy on devices with smaller real estates.

