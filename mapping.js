// var mymap = L.map('mapid').setView([55.0583836008072, 15.0418156516163], 13);
var north = 55.0583836008072,
    east = 15.0418156516163,
    south = 47.2701236047002,
    west = 5.8663152683722;

// var southWest = L.latLng(40.712, -74.227),
//     northEast = L.latLng(40.774, -74.125),
//     bounds = L.latLngBounds(southWest, northEast);
//
// var mymap = L.map('mapid', {
//     maxBounds: bounds,   // Then add it here..
//     maxZoom: 19,
//     minZoom: 10
// });


var mymap = L.map('mapid').setView([(north + south) / 2, (east + west) / 2], 5);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamhlcnJpbmctZW5nIiwiYSI6ImNrZjM2YmE4bjAwNjQyeW55emF1ZWY5MHAifQ._9RMUyQWV7myURtskZ7dcQ', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);

console.log("script ran");
