'use strict';

var wikiElem;
var infoWindow;

/*** MODEL DATA ***/
var markers = ko.observableArray([]);
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
        title: 'Union Square Open Floor Plan',
        location: {
            lat: 40.7347062,
            lng: -73.9895759
        },
    },
    {
        title: 'East Village Hip Studio',
        location: {
            lat: 40.7281777,
            lng: -73.984377
        },
    },
    {
        title: 'TriBeCa Artsy Bachelor Pad',
        location: {
            lat: 40.7195264,
            lng: -74.0089934
        },
    },
];

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
    // this.places = ko.observableArray([]);
    this.places = markers;

    // Keep track of the selected marker
    this.currentMarker = ko.observable(this.places()[0]);

    // Create function to engage the marker
    this.selectMarker = function(clickedMarker) {
        self.currentMarker(clickedMarker);
        toggleBouncing(self.currentMarker());
        populateInfoWindow(self.currentMarker(), infoWindow);
        console.log('current Marker: ' + self.currentMarker().title);
    };
};


/**
 * Retrieves a tidbit of general information about a location from Wikipedia.
 * @return {String} Wiki information.
 */
var getWikiData = function(place) {
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&' +
        'search=' + place + '&format=json&callback=wikiCallback';

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
        console.log(wikiInfo);

        return (wikiInfo);
    }).fail((err) => {
        console.log(err);
        return ('No Wikipedia data available.')
    });
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
            '<div>' + marker.data + '</div>'
        );
        markerWindow.open(map, marker);

        // NULL the marker property upon close
        markerWindow.addListener('closeclick', () => {
            markerWindow.marker = null;
        });
    }
};

/**
 * Enable/Disables the bouncing animation for a marker.
 */
var toggleBouncing = function(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
};

/**
 * Creates the map, markers, and all basic map functionality
 */
var initMap = function() {
    var marker;

    // Create the map
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7413549,
            lng: -73.9980244
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

        marker.data = getWikiData(title);

        // Open an InfoWindow whenever the marker is clicked.
        marker.addListener('click', function() {
            populateInfoWindow(this, infoWindow);
            // Make marker bounce when selected
            //FIXME: Doesn't bounce until secondary click.
            toggleBouncing(this);
        });

        // Add marker to Observable markers array
        markers.push(marker);
    }

};

// Activate KnockoutJS
ko.applyBindings(new ViewModel());