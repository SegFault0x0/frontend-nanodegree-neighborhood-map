'use strict';
/**
 * @author Justin D
 * @date 12/27/2016
 * @purpose Udacity Neighborhood Map project
 *
 * This project utilizes the [Google Maps Javascript API]
 * (https://developers.google.com/maps/documentation/javascript/reference) to
 * display a map detailing points of interest in a certain area. The user can
 * click any of the representative markers for information about that point.
 * Marker information is provided by the [Wikipedia API]
 * (https://www.mediawiki.org/wiki/API:Main_page).
 */

var MENU_WIDTH = 300;

// Google variables
var map;
var infoWindow;
var didGoogleAPILoad = false;

var displayMarkers = function() {};
var toggleBouncing = function() {};

/*** MODEL DATA ***/
var markers = ko.observableArray();

// Keep track of the Wikipedia data when it arrives
var wikiData = [];

var locations = [
    {
        title: 'Park Avenue',
        location: {
            lat: 40.7713024,
            lng: -73.9632393
        },
    },
    {
        title: 'Starbucks',
        location: {
            lat: 40.7444883,
            lng: -73.9949465
        },
    },
    {
        title: 'Empire State Building',
        location: {

            lat: 40.756124,
            lng: -73.986669
        },
    },
    {
        title: 'TriBeCa Artsy Bachelor Pad',
        location: {
            lat: 40.7195264,
            lng: -74.0089934
        },
    },
    {
        title: 'Strand Bookstore',
        location: {
            lat: 40.7347062,
            lng: -73.9895759
        },
    },
];

/**
 * Retrieves a tidbit of general information about a location from Wikipedia.
 */
var getWikiData = function(index, title) {
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&' +
        'search=' + title + '&format=json&callback=wikiCallback';

    // Grab Wikipedia data
    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
    }).done((response) => {
        /**
         * The third index of the array (2) contains the information, and the
         * best match on the search term is likely the first sub-index (0).
         */
        var wikiInfo = response[2][0];

        /**
         * Update the correct index of the wikiData array with the current
         * marker's Wikipedia information.
         */
        wikiData[index] = wikiInfo;
    }).fail((err) => {
        console.log(err);
        wikiData[index] = 'No Wikipedia data available.';
    });
};

/**
 * Serves as KnockoutJS's `Controller`.
 */
var ViewModel = function() {
    /**
     * Use `self` to access the ViewModel when the keyword `this` is referencing
     * an inner function.
     */
    var self = this;

    // Create the array of locations
    this.places = markers;

    // Create a two-way binding for the search feature
    this.searchName = ko.observable('');

    // Keep track of menu toggle status
    this.menuToggled = ko.observable(true);


    /**
     * Engages the marker as if it were clicked.
     * @param {google.maps.Marker} clickedMarker
     */
    this.selectMarker = function(clickedMarker) {
        toggleBouncing(clickedMarker);
        populateInfoWindow(clickedMarker, infoWindow);
    };

    /**
     * Returns an array filtered based upon whatever condition is tested for in
     * the callback.
     * @param {Array} array
     * @param {Function} callback
     * @return {Array} filteredArray
     */
    this.arrayFilter = function(array, callback) {
        var filteredArray = [];
        for (var i = 0, len = array.length; i < len; ++i) {
            if (callback(array[i])) {
                filteredArray.push(array[i]);
            }
        }
        return filteredArray;
    };

    /**
     * Performs a text-based filter on a marker's title/name and returns a new
     * array with a filtered subset of values.
     * @return {Array}
     */
    this.filteredList = ko.computed(function() {
        var filter = self.searchName().toLowerCase();

        if (!filter) {
            // Re-display markers upon clearing the filter
            displayMarkers(self.places());
            return self.places();
        } else {
            return (
                // This will return a new, filtered marker list
                self.arrayFilter(self.places(), function(marker) {
                    // Return true or false whether the filter matches the title
                    if (!marker.title.toLowerCase().startsWith(filter)) {
                        marker.setMap(null);
                        return false;
                    } else {
                        return true;
                    }
                })
            );
        }
    }, this);

    /**
     * Slides the navigation menu open (right).
     */
    this.openNav = function() {
        document.getElementById("nav").style.width = MENU_WIDTH + 'px';
        self.menuToggled = true;
    };

    /**
     * Slides the navigation menu closed (left).
     */
    this.closeNav = function() {
        document.getElementById("nav").style.width = "0";
        self.menuToggled = false;
    };
};

/**
 * Populates data for an InfoWindow.
 * @param {google.maps.Marker} marker
 * @param {google.maps.InfoWindow} markerWindow
 */
var populateInfoWindow = function(marker, markerWindow) {
    // Don't open another markerWindow if one is already opened.
    if (markerWindow.marker != marker) {
        markerWindow.marker = marker;
        var info = wikiData[marker.wikiIndex];

        if (info === undefined) {
            info = 'Sorry, there isn\'t any data available for this location' +
                ' at this time.';
        }

        markerWindow.setContent(
            '<div><b>' + marker.title + '</b></div>' +
            '<div>' + '<hr>' + '</div>' +
            '<div>' + info + '</div>'
        );
        markerWindow.open(map, marker);

        // NULL the marker property upon close
        markerWindow.addListener('closeclick', () => {
            markerWindow.marker = null;
        });
    }
};

/**
 * Handle instances where the map can't load due to a
 * net::ERR_CONNECTION_REFUSED error.
 */
var googleLoadTimer = setInterval(function() {
  if (!didGoogleAPILoad) {
    alert('There was an error in loading the Google Maps API.  Please' +
      ' check your Internet connection and try again.');
  }
  clearInterval(googleLoadTimer);
}, 5000);

/**
 * Creates the map, markers, and all basic map functionality
 */
var initMap = function() {
    didGoogleAPILoad = true;

    // Create the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7413549,
            lng: -73.9980244
        },
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
        },
        zoom: 13
    });

    // Populate the map with markers for Points of Interest
    infoWindow = new google.maps.InfoWindow();
    var title = '';
    var marker = {};

    for (var i = 0, len = locations.length; i < len; ++i) {
        title = locations[i].title;
        marker = new google.maps.Marker({
            position: locations[i].location,
            map: map,
            title: title,
            /**
             * Animation MUST be initialized or markers will initially require
             * two clicks before animating.
             */
            animation: google.maps.Animation.DROP,
        });

        /**
         * Keep track of the index for later when the Wikipedia AJAX completes.
         * This was done since the closure below wouldn't cooperate.
         */
        marker.wikiIndex = i;

        getWikiData(i, title);

        // Open an InfoWindow whenever the marker is clicked.
        // marker.addListener('click', (function(index) {
        marker.addListener('click', (function() {
            populateInfoWindow(this, infoWindow);

            // Make marker bounce when selected
            toggleBouncing(this);
        }));
        // })(i));

        // Add marker to Observable markers array
        markers.push(marker);
    }

    /**
     * Enable/Disables the bouncing animation for a marker.
     * @param {google.maps.Marker} marker
     */
    toggleBouncing = function(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    };

    /**
     * Shows markers on the map and resize map boundaries around them.
     * @param {google.maps.Marker[]} markerArray
     */
    displayMarkers = function(markerArray) {
        var bounds = new google.maps.LatLngBounds();

        for (var i = 0, len = markerArray.length; i < len; ++i) {
            // Re-add the marker to the map
            markerArray[i].setMap(map);

            // Ensure the marker will fit on the map by extending the boundary.
            bounds.extend(markerArray[i].position);
        }

        // Force a map/marker redraw
        map.fitBounds(bounds);
    };
};

// Activate KnockoutJS
ko.applyBindings(new ViewModel());