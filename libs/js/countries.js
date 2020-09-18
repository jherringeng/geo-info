var north = 59.3607741849963,
		east = 1.7689121033873,
		south = 49.9028622252397,
		west = -8.61772077108559;

var latCentre = (north + south) / 2,
		lngCentre = (east + west) / 2,
		scaling = 5;


var countryName, countryBorders, countryCodes;
var countryInfo, countryTimeInfo, countryWikiInfo;
var monthsArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var requestURL = '/mapping/libs/js/countries_small.json';
var request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();
request.onload = function() {
	countryBorders = request.response[0];
	console.log(countryBorders);
	countryCodes = request.response[1];
	console.log(countryCodes);
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

				console.log(result);

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

				console.log(result);

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
		console.log(countryCode3)

		$.ajax({
			url: "libs/php/getCountryClimateInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				country: countryCode3
			},
			success: function(result) {

				console.log(result);

				if (result.status.name == "ok") {

					countryPrecipitationInfo = result['data'][0]['monthVals'];

					// countryPrecipitationInfo = {
					// 	'January': result['data'][0]['monthVals'][0],
					// 	'February': result['data'][0]['monthVals'][1],
					// 	'March': result['data'][0]['monthVals'][2],
					// 	'April': result['data'][0]['monthVals'][3],
					// 	'May': result['data'][0]['monthVals'][4],
					// 	'June': result['data'][0]['monthVals'][5],
					// 	'July': result['data'][0]['monthVals'][6],
					//
					// }

				}

			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log("Request failed");
			}
		});

	});

	$('#showInfo').click(function() {
		$("#infoModalBody").html("");

		var selectedInfo = $('#selectInfo').val();
		if (selectedInfo === "general"){
			$("#infoModalLabel").html(countryName + ' General Information');
			createTable(countryInfo);
		}
		else if (selectedInfo === "precip") {
			$("#infoModalLabel").html(countryName + ' Rainfall Information')
			createTable(countryPrecipitationInfo);
		}
		else if (selectedInfo === "wiki") {
			$("#infoModalLabel").html(countryName + ' Wikipedia Information')
			createWikiInfo(countryWikiInfo);
		}
		else if (selectedInfo === "climate") {
			$("#infoModalLabel").html(countryName + ' Rainfall')
			$("#infoModalBody").append('<canvas id="myChart" width="400" height="400"></canvas>');
			var label = "Rainfall (mm)";
			createGraph(label,monthsArray,countryPrecipitationInfo);
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
	console.log(wikiInfo);
	$("#infoModalBody").append('<imag src="' + wikiInfo['Thumbnail'] + '" class="float-left">');
	$("#infoModalBody").append('<p>' + wikiInfo['Summary'] + '</p>');
	$("#infoModalBody").append('<a href="' + wikiInfo['Wiki URL'] + '" target="_blank" class="btn btn-primary text-center">Read More</a>');
}

function createGraph(label, xAxis, yAxis) {
	var ctx = document.getElementById('myChart');
	var myChart = new Chart(ctx, {
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
