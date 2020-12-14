	$('#btnLocationsRun').click(function() {

		var location = encodeURIComponent($('#selLocation').val());

		$.ajax({
			url: "libs/php/getLocationInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				location: location,
				country: $('#selCountry').val(),
				lang: $('#selLanguage').val()
			},
			success: function(result) {

				// console.log(result);

				if (result.status.name == "ok") {
					$('#txtName').html(result['data'][0]['toponymName']);
					$('#txtCountry').html(result['data'][0]['countryName']);
					$('#txtLatitude').html(result['data'][0]['lat']);
					$('#txtLongitude').html(result['data'][0]['lng']);
					$('#txtPopulation').html(result['data'][0]['population']);

				}

			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		});


	});
