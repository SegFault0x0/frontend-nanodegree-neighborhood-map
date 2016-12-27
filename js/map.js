'use strict';

var wikiElem;

var locations = [
    {title: 'Park Avenue', location: {lat: 40.7713024, lng: -73.9632393}},
    {title: 'Starbucks', location: {lat: 40.7444883, lng: -73.9949465}},
    {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
    {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
];

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

        clearTimeout(wikiTmeout);

        return (wikiInfo);
    }).fail((err) => {
        console.log(err);
        return ('No Wikipedia data available.')
    });
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

    // Function that populates data for an InfoWindow
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


    // Create the map
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7413549,
            lng: -73.9980244
        },
        zoom: 13
    });


    // Populate the map with markers for Points Of Interest
    var infoWindow = new google.maps.InfoWindow();
    var latLon = {};
    var title = '';

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
    }

};

