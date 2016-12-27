'use strict';

var MENU_WIDTH = 300;

var wikiElem;
var map;
var infoWindow;

var displayMarkers = function() {};
var toggleBouncing = function() {};

/*** MODEL DATA ***/
var markers = ko.observableArray();

// Keep track of the Wikipedia data when it arrives
var wikiData = ko.observableArray();


var locations = [
    {
        title: 'Park Avenue',
        location: {
            lat: 40.7713024,
            lng: -73.9632393
        },
        wikiInfo: ko.observable(''),
    },
    {
        title: 'Starbucks',
        location: {
            lat: 40.7444883,
            lng: -73.9949465
        },
        wikiInfo: ko.observable(''),
    },
    {
        title: 'East Village Hip Studio',
        location: {
            lat: 40.7281777,
            lng: -73.984377
        },
        wikiInfo: ko.observable(''),
    },
    {
        title: 'TriBeCa Artsy Bachelor Pad',
        location: {
            lat: 40.7195264,
            lng: -74.0089934
        },
        wikiInfo: ko.observable(''),
    },
    {
        title: 'Starry Night Pavilion',
        location: {
            lat: 40.7347062,
            lng: -73.9895759
        },
        wikiInfo: ko.observable(''),
    },
];

// Initialize wikiData
for (var i = 0, len = locations.length; i < len; ++i) {
    wikiData.push({wikiInfo: ''});
}

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
         * The third index of the array contains the information, and the best
         * match on the search term is likely the first sub-index.
         */
        var wikiInfo = response[2][0];

        // Update the current marker's Wikipedia information
        wikiData.splice(index, 0, wikiInfo);
        console.log(wikiData()[index]);
    }).fail((err) => {
        console.log(err);
        marker.wikiData() = 'No Wikipedia data available.';
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


    // Create function to engage the marker
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
     * Slides the navigation menu open to the right.
     */
    this.openNav = function() {
        document.getElementById("nav").style.width = MENU_WIDTH + 'px';
        self.menuToggled = true;
    }

    /**
     * Slides the navigation menu closed to the left.
     */
    this.closeNav = function() {
        document.getElementById("nav").style.width = "0";
        self.menuToggled = false;
    }
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
        markerWindow.setContent(
            '<div>' + marker.title + '</div>' +
            '<div>' + '<hr>' + '</div>' +
            '<div>lat: ' + marker.position.lat + ', lon: ' +
                marker.position.lon + '</div>' +
            '<div>' + wikiData() + '</div>'
        );
        markerWindow.open(map, marker);

        // NULL the marker property upon close
        markerWindow.addListener('closeclick', () => {
            markerWindow.marker = null;
        });
    }
};

/**
 * Creates the map, markers, and all basic map functionality
 */
var initMap = function() {
    var marker;

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
    var latLon = {};
    var title = '';
    var marker = {};

    for (var i = 0, len = locations.length; i < len; ++i) {
        latLon = locations[i].location;
        title = locations[i].title;
        marker = new google.maps.Marker({
            position: latLon,
            map: map,
            title: title,
        });

        getWikiData(i, title);
        // marker.wikiInfo.push(wikiData()[i]);


        // Open an InfoWindow whenever the marker is clicked.
        marker.addListener('click', function() {
        // marker.addListener('click', (function(that, ndx, windowCpy) {
            // populateInfoWindow(this, i, infoWindow);
            populateInfoWindow(this, infoWindow);
            // Make marker bounce when selected
            //FIXME: Doesn't bounce until secondary click.
            toggleBouncing(this);
        });

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

        // Extend the boundaries of the map for each marker
        for (var i = 0, len = markerArray.length; i < len; ++i) {
            markerArray[i].setMap(map);
            bounds.extend(markerArray[i].position);
        }

        // Force a map/marker redraw
        map.fitBounds(bounds);
    };
};

// Activate KnockoutJS
ko.applyBindings(new ViewModel());