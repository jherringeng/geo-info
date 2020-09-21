
const ajaxCalls = {
  getEarthQuakeInfo: (north, east, south, west) => {
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
					return earthquakesArray;
				}

			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log("Request failed: " + textStatus);
			}
		});
  }

}

// export default ajaxCalls;
