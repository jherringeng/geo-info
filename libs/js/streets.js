	$('#btnStreetsRun').click(function() {

		var street = encodeURIComponent($('#selStreet').val());

		$.ajax({
			url: "libs/php/getStreetInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				street: street
			},
			success: function(result) {

				console.log(result);

				if (result.status.name == "ok") {
					$('#txtName').html(result['data'][0]['street']);
					$('#txtLocality').html(result['data'][0]['locality']);
					$('#txtCountryCode').html(result['data'][0]['countryCode']);
					$('#txtLatitude').html(result['data'][0]['lat']);
					$('#txtLongitude').html(result['data'][0]['lng']);

				}

			},
			error: function(jqXHR, textStatus, errorThrown) {
				// $('#errorMessage').html(errorThrown);
			}
		});


	});
