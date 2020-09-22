var myMap;

var north = 59.3607741849963,
		east = 1.7689121033873,
		south = 49.9028622252397,
		west = -8.61772077108559;

var latCentre = (north + south) / 2, lngCentre = (east + west) / 2, scaling = 5;

var countryName, countryBorders, countryCodes;
var countryInfo, countryTimeInfo, countryWikiInfo, countryPrecipitationInfo, countryTemperatureInfo;
var countryGDPInfo = {}, countryGDPPersonInfo = {}, countryGDPGrowthInfo = {};
var earthquakesArray = [], majorCitiesArray = [];
var monthsArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var myChart, rainfallLabel = "Rainfall (mm)", temperatureLabel = "Temperature (deg C)";

// Get border and country code json data from countries_small
var requestURL = '/mapping/libs/js/countries_small.json';
var request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();
request.onload = function() {
	countryBorders = request.response[0];
	countryCodes = request.response[1];
	countryLangs = request.response[2];
	console.log(countryLangs);
}

$( document ).ready(function() {
	mymap = L.map('mapid').setView([latCentre, lngCentre], 5);

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamhlcnJpbmctZW5nIiwiYSI6ImNrZjM2YmE4bjAwNjQyeW55emF1ZWY5MHAifQ._9RMUyQWV7myURtskZ7dcQ', {
		 attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		 maxZoom: 18,
		 id: 'mapbox/streets-v11',
		 tileSize: 512,
		 zoomOffset: -1,
		 accessToken: 'your.mapbox.access.token'
	}).addTo(mymap);

	L.geoJSON(countryBorders).addTo(mymap);

});


// Gets country information and moves map
$('#btnRun').click(function() {

	var countryCode2 = $('#selCountry').val();

	$.ajax({
		url: "libs/php/getCountryInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: countryCode2
			// lang: $('#selLanguage').val()
		},
		success: function(result) {

			if (result.status.name == "ok") {

				countryName = result['data'][0]['countryName'];

				countryInfo = {
					"Name": result['data'][0]['countryName'],
					"Continent": result['data'][0]['continent'],
					"Capital": result['data'][0]['capital'],
					"Languages": result['data'][0]['languages'],
					'Population': result['data'][0]['population'],
					'Area': result['data'][0]['areaInSqKm']
				}

				north = result['data'][0]['north'];
		    east = result['data'][0]['east'];
		    south = result['data'][0]['south'];
		    west = result['data'][0]['west'];

				latCentre = (north + south) / 2;
				lngCentre = (east + west) / 2;

				var northWest = L.latLng(north, west),
					southEast = L.latLng(south, east),
					bounds = L.latLngBounds(northWest, southEast);
				mymap.flyToBounds(bounds);

				// Pass updated NESW data to get earthquake data
				getEarthQuakeInfo(north, east, south, west, earthquakesArray);

			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed");
		}
	});

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
					'Sunrise': result['data']['sunrise'],
					'Sunset': result['data']['sunset']
				}

			}

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed");
		}
	});

	$.ajax({
		url: "libs/php/getCountryWikiInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			countryName: countryName
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

	var countryCode3 = countryCodes[countryCode2];

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

	$.ajax({
		url: "libs/php/getMajorCitiesInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: countryCode2
		},
		success: function(result) {

			console.log(result);

			result['cities'].forEach(function(item) {
				var lat = item['latitude'], lng = item['longitude'];
				var marker = L.marker([lat, lng])
				marker.bindPopup("Name: " + item['name'] + ", Population: " + item['population'] + ", Lat: " + lat + ", Lng: " + lng );
				majorCitiesArray.push(marker);
			})

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Request failed: " + textStatus);
		}
	});

});

// Sets country information and format for the modal
$('#showInfo').click(function() {
	$("#infoModalBody").html("");

	var selectedInfo = $('#selectInfo').val();
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
		// $("#infoModalLabel").html(countryName + ' Climate Information');
		// $("#infoModalBody").append('<input type="radio" id="temp" name="graphSelector" value="temp" class="mr-2" checked><label for="temp" class="mr-2">Temperature</label>');
		// $("#infoModalBody").append('<input type="radio" id="rain" name="graphSelector" value="rain" class="mr-2"><label for="rain" class="mr-2">Rainfall</label><br>');
		// $("#infoModalBody").append('<canvas id="myChart" width="400" height="400"></canvas>');
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
	else if (selectedInfo === "wiki") {
		$("#infoModalLabel").html(countryName + ' Wikipedia Information')
		createWikiInfo(countryWikiInfo);
	}
	else if (selectedInfo === "precip") {
		$("#infoModalLabel").html(countryName + ' Rainfall')
		$("#infoModalBody").append('<canvas id="myChart" width="400" height="400"></canvas>');
		createGraph(rainfallLabel,monthsArray,countryPrecipitationInfo);
	}
	else if (selectedInfo === "temp") {
		$("#infoModalLabel").html(countryName + ' Temperature')
		$("#infoModalBody").append('<canvas id="myChart" width="400" height="400"></canvas>');
		var label = "Temperature (deg C)";
		createGraph(label,monthsArray,countryTemperatureInfo);
	}
	else {
		$("#infoModalLabel").html('Time Information')
		createTable(countryTimeInfo);
	}

	jQuery('#exampleModal').modal('toggle');
});

function createTable(showInfo) {
	$("#infoModalBody").append('<table id="infoTable" class="table">')
	$.each( showInfo, function( key, value ) {
		$("#infoModalBody").append('<tr><td>' + key + ' </td><td>' + value +'</td></tr>');
	});
	$("#infoModalBody").append('</table>')
}

function createWikiInfo(wikiInfo) {
	$("#infoModalBody").append('<imag src="' + wikiInfo['Thumbnail'] + '" class="float-left">');
	$("#infoModalBody").append('<p>' + wikiInfo['Summary'] + '</p>');
	$("#infoModalBody").append('<a href="' + wikiInfo['Wiki URL'] + '" target="_blank" class="btn btn-primary text-center">Read More</a>');
}

function createChartArea (chartTitle, chartNameId) {
	$("#infoModalLabel").html(countryName + ' ' + chartTitle);
	$.each( chartNameId, function( key, value ) {
		$("#infoModalBody").append('<input type="radio" id="' + value + '" name="graphSelector" value="' + value + '" class="mr-2" checked><label for="' + value + '" class="mr-2">' + key + '</label>');
	});
	$("#infoModalBody").append('<canvas id="myChart" width="400" height="400"></canvas>');
}

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

  }
});

$('#showMapOptions').click(function() {
	$("#infoModalBody").html("");
	$("#infoModalLabel").html(countryName + ' Map Options');
	$("#infoModalBody").append('<label for="earthquakes">Show Earthquakes</label>');
	$("#infoModalBody").append('<input type="checkbox" id="earthquakes" name="mapSelector" value="earthquakes"><br>');
	$("#infoModalBody").append('<label for="cities">Show Major Cities</label>');
	$("#infoModalBody").append('<input type="checkbox" id="cities" name="mapSelector" value="cities"><br>');
	jQuery('#exampleModal').modal('toggle');
});

$('body').on('change', 'input[name=mapSelector]:checkbox', function() {
	switch ($(this).attr('id')) {
		case 'earthquakes':
			console.log(earthquakesArray)
			if ($('#earthquakes').is(':checked')) {
				earthquakesArray.forEach(function(item) {
					item.addTo(mymap);
				})
			} else {
				earthquakesArray.forEach(function(item) {
					item.remove();
				})
			}
			break;
		case 'cities':
			if ($('#cities').is(':checked')) {
				majorCitiesArray.forEach(function(item) {
					item.addTo(mymap);
				})
			} else {
				majorCitiesArray.forEach(function(item) {
					item.remove();
				})
			}
			break;
	}
});

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

function getEarthQuakeInfo(north, east, south, west, earthquakesArray) {

		// Resets earthquake array to not display previous country again
		// earthquakesArray = [];

		$.ajax({
			url: "libs/php/getEarthQuakeInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				north: Math.round(north),
				east: Math.round(east),
				south: Math.round(south),
				west: Math.round(west)
			},
			success: function(result) {

				console.log(result);

				if (result.status.name == "ok") {

					result['data'].forEach(function(item) {
						var lat = item['lat'], lng = item['lng'];
						var radius = item['magnitude'] * 10000;
						var circle = L.circle([lat, lng], {
								color: 'red',
								fillColor: '#f03',
								fillOpacity: 0.5,
								radius: radius
						}) // .addTo(mymap);
						circle.bindPopup("Magnitude: " + item['magnitude'] + ", Lat: " + lat + ", Lng: " + lng + ", Datetime: " + item['datetime']);
						earthquakesArray.push(circle);
					})

					console.log(earthquakesArray)

				}

			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log("Request failed: " + textStatus);
			}
		});

}
