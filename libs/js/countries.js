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

					// $('#txtContinent').html(result['data'][0]['continent']);
					// $('#txtCapital').html(result['data'][0]['capital']);
					// $('#txtLanguages').html(result['data'][0]['languages']);
					// $('#txtPopulation').html(result['data'][0]['population']);
					// $('#txtArea').html(result['data'][0]['areaInSqKm']);

					var north = result['data'][0]['north'],
					    east = result['data'][0]['east'],
					    south = result['data'][0]['south'],
					    west = result['data'][0]['west'];

					var latCentre = (north + south) / 2,
							lngCentre = (east + west) / 2,
							scaling = 5;

					mymap.flyTo([latCentre, lngCentre], scaling)

					// var mymap = L.map('mapid').setView([(north + south) / 2, (east + west) / 2], 13);
					//
					// L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamhlcnJpbmctZW5nIiwiYSI6ImNrZjM2YmE4bjAwNjQyeW55emF1ZWY5MHAifQ._9RMUyQWV7myURtskZ7dcQ', {
					//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
					//     maxZoom: 18,
					//     id: 'mapbox/streets-v11',
					//     tileSize: 512,
					//     zoomOffset: -1,
					//     accessToken: 'your.mapbox.access.token'
					// }).addTo(mymap);

				}

			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log("Request failed");
			}
		});

	});
