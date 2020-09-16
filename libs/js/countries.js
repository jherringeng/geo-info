var north = 59.3607741849963,
		east = 1.7689121033873,
		south = 49.9028622252397,
		west = -8.61772077108559;

var latCentre = (north + south) / 2,
		lngCentre = (east + west) / 2,
		scaling = 5;



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
	});



	$('#btnRun').click(function() {

		// lang = $('#selLanguage').val();

		$.ajax({
			url: "libs/php/getCountryInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				country: $('#selCountry').val()
				// lang: $('#selLanguage').val()
			},
			success: function(result) {

				console.log(result);

				if (result.status.name == "ok") {

					$('#txtContinent').html(result['data'][0]['continent']);
					$('#txtCapital').html(result['data'][0]['capital']);
					$('#txtLanguages').html(result['data'][0]['languages']);
					$('#txtPopulation').html(result['data'][0]['population']);
					$('#txtArea').html(result['data'][0]['areaInSqKm']);

					north = result['data'][0]['north'];
			    east = result['data'][0]['east'];
			    south = result['data'][0]['south'];
			    west = result['data'][0]['west'];

					// latCentre = (north + south) / 2;
					// lngCentre = (east + west) / 2;
					// scaling = 5;
					//
					// mymap.flyTo([latCentre, lngCentre], 5);
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

	});

	$('#showInfo').click(function() {
		jQuery('#exampleModal').modal('toggle');
		console.log("Showing modal?")
	});
