var myMap;

var north = 59.3607741849963,
		east = 1.7689121033873,
		south = 49.9028622252397,
		west = -8.61772077108559;

var latCentre = 0, lngCentre = 0, scaling = 3;

var countryName, countryCodes, countryCodes2Borders = {};
var countryInfo, countryTimeInfo, countryWikiInfo, countryPrecipitationInfo, countryTemperatureInfo;
var countryGDPInfo = {}, countryGDPPersonInfo = {}, countryGDPGrowthInfo = {};
var countryPopDemo = {}, countryPopDemoFemale = {}, countryPopDemoMale = {};
var earthquakesArray = [];
var monthsArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var myChart, rainfallLabel = "Rainfall (mm)", temperatureLabel = "Temperature (deg C)";
var earthQuakesCheckbox = false, majorCitiesCheckbox = false, majorCitiesShown = false, earthquakesShown = false;
var countryBordergeoJSON;
var earthquakes;
var layersControl, baseMaps, overlayMaps, terrain, night, train;

// Get border and country code json data from countries_small
var requestURL = '/geo-info/libs/js/countries_small.json';
var request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();
request.onload = function() {
	countryCodes = request.response[0];
	console.log(countryCodes);
	countryLangs = request.response[1];

	if(!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
  } else {
    status.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(getCountryCode, error);
  }

}

// Create the map and add buttons
$( document ).ready(function() {

	mymap = L.map('mapid').setView([latCentre, lngCentre], 5);

	var roads = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamhlcnJpbmctZW5nIiwiYSI6ImNrZjM2YmE4bjAwNjQyeW55emF1ZWY5MHAifQ._9RMUyQWV7myURtskZ7dcQ', {
		 attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		 maxZoom: 18,
		 id: 'mapbox/streets-v11',
		 tileSize: 512,
		 zoomOffset: -1,
		 accessToken: 'your.mapbox.access.token'
	}).addTo(mymap);

	earthquakes = L.layerGroup();

	// L.tileLayer.provider('Stamen.Watercolor').addTo(mymap);
	terrain = L.tileLayer.provider('Esri.WorldImagery');
	night = L.tileLayer.provider('NASAGIBS.ViirsEarthAtNight2012');
	train = L.tileLayer.provider('OpenRailwayMap');

	baseMaps = {
		"Street View": roads,
		"Satellite View": terrain,
		"Night View": night
	};

	overlayMaps = {
	    "Railways": train,
			"Earthquakes": earthquakes
	};

	layersControl = L.control.layers(baseMaps, overlayMaps).addTo(mymap);

	L.easyButton('<img src="libs/icons/information.svg">', function(btn, map){
		$("#infoModalBody").html("");
		$("#infoModalLabel").html(countryName + ' General Information');
		createTable(countryInfo);
		jQuery('#exampleModal').modal('toggle');

	}, 'General information').addTo( mymap );

	L.easyButton('<img src="libs/icons/wall-clock.svg">', function(btn, map){
		$("#infoModalBody").html("");
		$("#infoModalLabel").html('Time Information')
		createTable(countryTimeInfo);
		jQuery('#exampleModal').modal('toggle');

	}, 'Timezone information').addTo( mymap );

	L.easyButton('<img src="libs/icons/reading-book.svg">', function(btn, map){
		$("#infoModalBody").html("");
		$("#infoModalLabel").html(countryName + ' Wikipedia Information')
		$("#infoModalBody").append('<img id="wiki-thumb" src="' + countryWikiInfo['Thumbnail'] + '" class="float-left">');
		$("#infoModalBody").append('<p>' + countryWikiInfo['Summary'] + '</p>');
		$("#infoModalBody").append('<a href="' + countryWikiInfo['Wiki URL'] + '" target="_blank" class="btn btn-primary text-center">Read More</a>');
		jQuery('#exampleModal').modal('toggle');
	}, 'Wikipedia Information').addTo( mymap );

	L.easyButton('<img src="libs/icons/demographics-of-a-population.svg">', function(btn, map){
		$("#infoModalBody").html("");
		if (jQuery.isEmptyObject( countryPopDemo )) {
			$("#infoModalLabel").html(countryName + ' Demographic Information');
			createInfoNotAvailable("demographic");
		}
		else {
			var chartTitle = 'Demographic Information';
			var chartNameId = {
				"People by Age": "demoPeople",
				"Males by Age": "demoMales",
				"Females by Age": "demoFemales"
			}
			createChartArea(chartTitle, chartNameId);
			createGraph("People in Age Ranges (millions)",Object.keys(countryPopDemo),Object.values(countryPopDemo));
		}
		jQuery('#exampleModal').modal('toggle');

	}, 'Demographics').addTo( mymap );

	L.easyButton('<img src="libs/icons/climate-change.svg">', function(btn, map){
		$("#infoModalBody").html("");
		var chartTitle = 'Climate Information';
		var chartNameId = {
			"Temperature": "temp",
			"Rainfall": "rain"
		}
		createChartArea(chartTitle, chartNameId);
		createGraph(temperatureLabel,monthsArray,countryTemperatureInfo);
		jQuery('#exampleModal').modal('toggle');

	}, 'Climate').addTo( mymap );

	L.easyButton('<img src="libs/icons/money-growth.svg">', function(btn, map){
		$("#infoModalBody").html("");
		var chartTitle = 'Economic Information';
		var chartNameId = {
			"GDP": "gdp",
			"GDP per Person": "gdpPerson",
			"GDP Growth": "gdpGrowth"
		}
		createChartArea(chartTitle, chartNameId);
		createGraph("GDP per year ($)",Object.keys(countryGDPInfo),Object.values(countryGDPInfo));
		jQuery('#exampleModal').modal('toggle');

	}, 'Gross Domestic Product').addTo( mymap );

	mymap.on('click', function(e){
	  var coord = e.latlng;
	  var position = {
			coords: {
				latitude: coord.lat,
				longitude: coord.lng
			}
		}
		getCountryCode(position);

	});



});

// Resizes map on window resize
$(window).on("resize", resize);

function resize(){

  mymap.invalidateSize();

}

// Call to get Country code after navigator getPosition
function getCountryCode(position) {
	const latitude  = position.coords.latitude;
	const longitude = position.coords.longitude;

	$.ajax({
		url: "libs/php/getCountryCode.php",
		type: 'POST',
		dataType: 'json',
		data: {
			lat: latitude,
			lng: longitude
		},
		success: function(result) {

			if (result.status.name == "ok") {

				console.log(result['data']['countryCode']);
				$("#selCountry").val(result['data']['countryCode']).change();

			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed");
		}
	});
}

function error() {
	alert('Unable to retrieve your location');
}

// Gets country information and moves map ###############################################################################
// ######################################################################################################################
$('#selCountry').change(function() {

	var countryCode2 = $('#selCountry').val();
	var countryCode3 = countryCodes[countryCode2];

	removeMapMarkers();
	resetArraysObjects();

	// Get Country Border and add to map
	$.ajax({
		url: "libs/php/getCountryBorderFromCountryCode.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: countryCode2.toUpperCase(),
		},
		success: function(result) {

			if (result.status.name == "ok") {
				console.log(result['data'])

				if (typeof countryBordergeoJSON !== "undefined") {
					countryBordergeoJSON.remove(mymap);
				}

				countryBordergeoJSON = L.geoJSON(result['data']).addTo(mymap);

			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed");
		}
	});

	// Get Country Info
	$.ajax({
		url: "libs/php/getCountryInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: countryCode2

		},
		success: function(result) {

			if (result.status.name == "ok") {

				console.log('Got country info and earthquakes')
				console.log(result['data'])
				countryName = result['data']['countryInfo']['countryName'];

				north = result['data']['countryInfo']['north'];
		    east = result['data']['countryInfo']['east'];
		    south = result['data']['countryInfo']['south'];
		    west = result['data']['countryInfo']['west'];

				getWikiInfo();

				latCentre = (north + south) / 2;
				lngCentre = (east + west) / 2;

				var northWest = L.latLng(north, west),
					southEast = L.latLng(south, east),
					bounds = L.latLngBounds(northWest, southEast);
				mymap.flyToBounds(bounds);

				// Processes language codes to names
				var langString = processLangString(result['data']['countryInfo']['languages']);

				countryInfo = {
					"Name": result['data']['countryInfo']['countryName'],
					"Continent": result['data']['countryInfo']['continent'],
					"Capital": result['data']['countryInfo']['capital'],
					"Languages": langString,
					'Population': result['data']['countryInfo']['population'],
					'Area': result['data']['countryInfo']['areaInSqKm']
				}

				result['data']['earthquakes'].forEach(function(item) {
					var lat = item['lat'], lng = item['lng'];
					var radius = item['magnitude'] * 8000;
					var circle = L.circle([lat, lng], {
							color: 'red',
							fillColor: '#f03',
							fillOpacity: 0.5,
							radius: radius
					});
					circle.bindPopup("Magnitude: " + item['magnitude'] + ", Lat: " + lat + ", Lng: " + lng + ", Datetime: " + item['datetime']);
					earthquakesArray.push(circle);
				});

				console.log(earthquakesArray)
				earthquakes = L.layerGroup(earthquakesArray);

				overlayMaps = {
				    "Railways": train,
						"Earthquakes": earthquakes
				};

				mymap.removeControl(layersControl);

				layersControl = L.control.layers(baseMaps, overlayMaps).addTo(mymap);

			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed");
		}
	});

	// Get Time Info
	$.ajax({
		url: "libs/php/getTimeInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			lat: latCentre,
			lng: lngCentre
		},
		success: function(result) {

			if (result.status.name == "ok") {

				countryTimeInfo = {
					'Time': result['data']['time'],
					'GMT Offset': result['data']['gmtOffset'],
					'Timezone': result['data']['timezoneId'],
					'Sunrise': result['data']['sunrise'],
					'Sunset': result['data']['sunset']
				}

			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed");
		}
	});

	// Get GDP Info
	$.ajax({
		url: "libs/php/getCountryGDPInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: countryCode2
		},
		success: function(result) {

			if (result.status.name == "ok") {

				var rawCountryGDPInfo = result['data'][1];
				for (var i = 1; i < 11; i++) {
					countryGDPInfo[rawCountryGDPInfo[i]["date"]] = rawCountryGDPInfo[i]["value"];
				}
			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed");
		}
	});

	// Get GDP per person
	$.ajax({
		url: "libs/php/getCountryGDPPersonInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: countryCode2
		},
		success: function(result) {

			if (result.status.name == "ok") {

				var rawCountryGDPInfo = result['data'][1];
				for (var i = 1; i < 11; i++) {
					countryGDPPersonInfo[rawCountryGDPInfo[i]["date"]] = rawCountryGDPInfo[i]["value"];
				}
			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed");
		}
	});

	// Get GDP growth per person
	$.ajax({
		url: "libs/php/getCountryGDPGrowthInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: countryCode2
		},
		success: function(result) {

			if (result.status.name == "ok") {

				var rawCountryGDPInfo = result['data'][1];
				for (var i = 1; i < 11; i++) {
					countryGDPGrowthInfo[rawCountryGDPInfo[i]["date"]] = rawCountryGDPInfo[i]["value"];
				}
			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed");
		}
	});

	//Get demo graphics info
	$.ajax({
		url: "libs/php/getCountryDemoCovidInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: countryCode2
		},
		success: function(result) {

			console.log(result);

			try {
				let firstKey = Object.keys(result['data'])[0];
				result['data'][firstKey]['CasebyAgeSex'].forEach(function(item) {
					countryPopDemo[item['age_group']] = parseInt(item['populationin1000sF']) + parseInt(item['populationin1000sM']);
					countryPopDemoMale[item['age_group']] = parseInt(item['populationin1000sM']);
					countryPopDemoFemale[item['age_group']] = parseInt(item['populationin1000sF']);
				});
			}
			catch(e) {
				console.log(e.message);
			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed: " + textStatus);
		}
	});

	// Get rainfall data
	$.ajax({
		url: "libs/php/getCountryClimateInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: countryCode3
		},
		success: function(result) {

			if (result.status.name == "ok") {

				countryPrecipitationInfo = result['data'][0]['monthVals'];

			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed");
		}
	});

	// Get temperature data
	$.ajax({
		url: "libs/php/getCountryTemperatureInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: countryCode3
		},
		success: function(result) {

			if (result.status.name == "ok") {

				countryTemperatureInfo = result['data'][0]['monthVals'];

			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed");
		}
	});

});

// Create icon key modal
$('#icon-key').click(function() {
	$("#infoModalLabel").html('Icon Key');
	$("#infoModalBody").html('<table id="iconKey" class="table"></table> ');
	$("#iconKey").append('<tr><td>General Information</td><td><img src="libs/icons/information.svg"></td></tr>');
	$("#iconKey").append('<tr><td>Timezone Information</td><td><img width="18" height="18" src="libs/icons/wall-clock.svg"></td></tr>');
	$("#iconKey").append('<tr><td>Population Demographics</td><td><img src="libs/icons/demographics-of-a-population.svg"></td></tr>');
	$("#iconKey").append('<tr><td>Climate Information</td><td><img src="libs/icons/climate-change.svg"></td></tr>');
	$("#iconKey").append('<tr><td>Gross Domestic Product</td><td><img src="libs/icons/money-growth.svg"></td></tr>');
	$("#iconKey").append('<tr><td>Terrain View</td><td><img width="18" height="18" src="libs/icons/terrain.svg"></td></tr>');
	$("#iconKey").append('<tr><td>Night View</td><td><img src="libs/icons/moon.svg"></td></tr>');
	$("#iconKey").append('<tr><td>Railways</td><td><img width="18" height="18" src="libs/icons/train.svg"></td></tr>');
	$("#iconKey").append('<tr><td>Radiation</td><td><img src="libs/icons/radiactive.svg"></td></tr>');
	$("#iconKey").append('<tr><td>Recent Earthquakes</td><td><img width="18" height="18" src="libs/icons/earthquake.svg"></td></tr>');
	$("#iconKey").append('<tr><td>Cities with above 1m Population</td><td><img width="18" height="18" src="libs/icons/building.svg"></td></tr>');
	jQuery('#exampleModal').modal('toggle');
});

// Sets country information and format for the modal
$('.infoPicker').click(function() {
	$("#infoModalBody").html("");

	// Gets value of #selectInfo to be passed to if-else statements (change to switch-case?)
	var selectedInfo = $(this).val();

	if (selectedInfo === "general"){
		$("#infoModalLabel").html(countryName + ' General Information');
		createTable(countryInfo);
	}
	else if (selectedInfo === "climate") {
		var chartTitle = 'Climate Information';
		var chartNameId = {
			"Temperature": "temp",
			"Rainfall": "rain"
		}
		createChartArea(chartTitle, chartNameId);
		createGraph(temperatureLabel,monthsArray,countryTemperatureInfo);
	}
	else if (selectedInfo === "economy") {
		var chartTitle = 'Economic Information';
		var chartNameId = {
			"GDP": "gdp",
			"GDP per Person": "gdpPerson",
			"GDP Growth": "gdpGrowth"
		}
		createChartArea(chartTitle, chartNameId);
		createGraph("GDP per year ($)",Object.keys(countryGDPInfo),Object.values(countryGDPInfo));
	}
	else if (selectedInfo === "demographics") {
		if (jQuery.isEmptyObject( countryPopDemo )) {
			$("#infoModalLabel").html(countryName + ' Demographic Information');
			createInfoNotAvailable("demographic");
		}
		else {
			var chartTitle = 'Demographic Information';
			var chartNameId = {
				"People by Age": "demoPeople",
				"Males by Age": "demoMales",
				"Females by Age": "demoFemales"
			}
			createChartArea(chartTitle, chartNameId);
			createGraph("People in Age Ranges (millions)",Object.keys(countryPopDemo),Object.values(countryPopDemo));
		}
	}
	else if (selectedInfo === "wiki") {
		$("#infoModalLabel").html(countryName + ' Wikipedia Information')
		createWikiInfo(countryWikiInfo);
	}
	else {
		$("#infoModalLabel").html('Time Information')
		createTable(countryTimeInfo);
	}

	jQuery('#exampleModal').modal('toggle');
});

function createInfoNotAvailable(info) {
	$("#infoModalBody").append('Sorry, ' + info + ' is not available for this country.');
}

function createTable(showInfo) {
	$("#infoModalBody").append('<table id="infoTable"></table>');
	$.each( showInfo, function( key, value ) {
		$("#infoTable").append('<tr><td>' + key + ' </td><td>' + value +'</td></tr>');
	});
}

function createWikiInfo(wikiInfo) {
	$("#infoModalBody").append('<img id="wiki-thumb" src="' + wikiInfo['Thumbnail'] + '" class="float-left">');
	$("#infoModalBody").append('<p>' + wikiInfo['Summary'] + '</p>');
	$("#infoModalBody").append('<a href="' + wikiInfo['Wiki URL'] + '" target="_blank" class="btn btn-primary text-center">Read More</a>');
}

// Creates chart area with chartTitle and object passed by chartNameId. Radiobuttons and labels create through chartNameId
function createChartArea (chartTitle, chartNameId) {
	$("#infoModalLabel").html(countryName + ' ' + chartTitle);
	$.each( chartNameId, function( key, value ) {
		$("#infoModalBody").append('<div class="d-inline"><input type="radio" id="' + value + '" name="graphSelector" value="' + value + '" class="mr-2"><label for="' + value + '" class="mr-2">' + key + '</label></div>');
	});
	var ids = Object.values(chartNameId);
	$("#" + ids[0]).prop( "checked", true );
	$("#infoModalBody").append('<canvas id="myChart" width="100%" height="60vh"></canvas>');
}

// Changes chart and info on change of radiobuttons created in createChartArea()
$('body').on('change', 'input[name=graphSelector]:radio', function() {
	myChart.destroy();
  switch ($(this).val()) {
    case 'temp':
			createGraph(temperatureLabel,monthsArray,countryTemperatureInfo);
      break;
    case 'rain':
			createGraph(rainfallLabel,monthsArray,countryPrecipitationInfo);
      break;
		case 'gdp':
			createGraph("GDP per year ($)",Object.keys(countryGDPInfo),Object.values(countryGDPInfo));
      break;
		case 'gdpPerson':
			createGraph("GDP per Person per year ($)",Object.keys(countryGDPPersonInfo),Object.values(countryGDPPersonInfo));
      break;
		case 'gdpGrowth':
			createGraph("GDP Growth per year (%)",Object.keys(countryGDPGrowthInfo),Object.values(countryGDPGrowthInfo));
      break;
		case 'demoPeople':
			createGraph("People by Age (millions)",Object.keys(countryPopDemo),Object.values(countryPopDemo));
      break;
		case 'demoFemales':
			createGraph("Females by Age (millions)",Object.keys(countryPopDemoFemale),Object.values(countryPopDemoFemale));
      break;
		case 'demoMales':
			createGraph("Males by Age (millions)",Object.keys(countryPopDemoMale),Object.values(countryPopDemoMale));
      break;

  }
});

// Creates checkboxes and labels for turning map information on and off. State of checkboxes saved by earthQuakesCheckbox & majorCitiesCheckbox
$('#showMapOptions').click(function() {
	$("#infoModalBody").html("");
	$("#infoModalLabel").html(countryName + ' Map Options');
	$("#infoModalBody").append('<label for="earthquakes">Show Earthquakes</label>');
	$("#infoModalBody").append('<input type="checkbox" id="earthquakes" name="mapSelector" value="earthquakes"><br>');
	$("#infoModalBody").append('<label for="cities">Show Major Cities</label>');
	$("#infoModalBody").append('<input type="checkbox" id="cities" name="mapSelector" value="cities"><br>');
	$("#earthquakes").prop( "checked", earthQuakesCheckbox );
	$("#cities").prop( "checked", majorCitiesCheckbox );
	jQuery('#exampleModal').modal('toggle');
});

// For removing map markers when switching countries
function removeMapMarkers() {
	if (earthquakesArray.length > 0) {
		earthquakesArray.forEach(function(item) {
			item.remove();
		})
	}
}

function createGraph(label, xAxis, yAxis) {
	var ctx = document.getElementById('myChart');
	myChart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: xAxis,
	        datasets: [{
	            label: label,
	            data: yAxis,
	            backgroundColor: [
	                'rgba(255, 99, 132, 0.2)',
	                'rgba(54, 162, 235, 0.2)',
	                'rgba(255, 206, 86, 0.2)',
	                'rgba(75, 192, 192, 0.2)',
	                'rgba(153, 102, 255, 0.2)',
	                'rgba(255, 159, 64, 0.2)',
									'rgba(255, 99, 132, 0.2)',
	                'rgba(54, 162, 235, 0.2)',
	                'rgba(255, 206, 86, 0.2)',
	                'rgba(75, 192, 192, 0.2)',
	                'rgba(153, 102, 255, 0.2)',
	                'rgba(255, 159, 64, 0.2)',
	            ],
	            borderColor: [
	                'rgba(255, 99, 132, 1)',
	                'rgba(54, 162, 235, 1)',
	                'rgba(255, 206, 86, 1)',
	                'rgba(75, 192, 192, 1)',
	                'rgba(153, 102, 255, 1)',
	                'rgba(255, 159, 64, 1)',
									'rgba(255, 99, 132, 1)',
	                'rgba(54, 162, 235, 1)',
	                'rgba(255, 206, 86, 1)',
	                'rgba(75, 192, 192, 1)',
	                'rgba(153, 102, 255, 1)',
	                'rgba(255, 159, 64, 1)'
	            ],
	            borderWidth: 1
	        }]
	    },
	    options: {
	        scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero: true
	                }
	            }]
	        }
	    }
	});
}

// function getEarthQuakeInfo() {
//
// 		earthquakesArray = [];
//
// 		$.ajax({
// 			url: "libs/php/getEarthQuakeInfo.php",
// 			type: 'POST',
// 			dataType: 'json',
// 			data: {
// 				north: Math.round(north),
// 				east: Math.round(east),
// 				south: Math.round(south),
// 				west: Math.round(west)
// 			},
// 			success: function(result) {
//
// 				console.log(result);
//
// 				if (result.status.name == "ok") {
//
// 					result['data'].forEach(function(item) {
// 						var lat = item['lat'], lng = item['lng'];
// 						var radius = item['magnitude'] * 10000;
// 						var circle = L.circle([lat, lng], {
// 								color: 'red',
// 								fillColor: '#f03',
// 								fillOpacity: 0.5,
// 								radius: radius
// 						}) // .addTo(mymap);
// 						circle.bindPopup("Magnitude: " + item['magnitude'] + ", Lat: " + lat + ", Lng: " + lng + ", Datetime: " + item['datetime']);
// 						earthquakesArray.push(circle);
// 					})
//
// 				}
//
// 			},
// 			error: function(jqXHR, textStatus, errorThrown) {
// 				console.log("Request failed: " + textStatus);
// 			}
// 		});
//
// }

function getWikiInfo() {
	$.ajax({
		url: "libs/php/getCountryWikiInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			countryName: countryName.replace(" ", "+")
		},
		success: function(result) {

			console.log(result);

			if (result.status.name == "ok") {

				countryWikiInfo = {
					'Name': result['data'][0]['title'],
					'Summary': result['data'][0]['summary'],
					'Wiki URL': "https://" + result['data'][0]['wikipediaUrl'],
					'Thumbnail': result['data'][0]['thumbnailImg']
				}

			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed:" + textStatus)
		}
	});
}

function processLangString(languages) {
	var langArray = languages.split(",");
	var langArrayProcessed = [];
	langArray.forEach(function(item) {
		if (item.includes("-")){
			let langSplit = item.split("-");
			item = langSplit[0];
			if (item.includes(";")){
				let langSplit = item.split(";");
				item = langSplit.join(", ");;
			}
		}
		try {
			langArrayProcessed.push(countryLangs[item]['name']);
		}
		catch(err) {
			langArrayProcessed.push(item);
		}
	});
	var langString = langArrayProcessed.join(", ");
	return langString;
}

function resetArraysObjects() {
	countryName = "";
	countryInfo = {}; countryTimeInfo = {}; countryWikiInfo = {};
	countryPrecipitationInfo = []; countryTemperatureInfo = [];
	countryGDPInfo = {}; countryGDPPersonInfo = {}; countryGDPGrowthInfo = {};
	countryPopDemo = {}; countryPopDemoFemale = {}; countryPopDemoMale = {};
	earthquakesArray = [];
}
