	$('#btnRun').click(function() {

		$.ajax({
			url: "libs/php/getClosestInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				lat: $('#selLat').val(),
				lng: $('#selLong').val()
			},
			success: function(result) {

				console.log(result);

				if (result.status.name == "ok") {
					$('#txtName').html(result['data']['houseNumber']);
					$('#txtStreet').html(result['data']['street']);
					$('#txtLocality').html(result['data']['locality']);
					$('#txtCountryCode').html(result['data']['countryCode']);
					$('#txtPostCode').html(result['data']['postalcode']);
					$('#txtLatitude').html(result['data']['lat']);
					$('#txtLongitude').html(result['data']['lng']);

				}

			},
			error: function(jqXHR, textStatus, errorThrown) {
				// $('#errorMessage').html(errorThrown);
			}
		});


	});
