<?php

$curl = curl_init();
  //"https://countries-cities.p.rapidapi.com/location/country/us/city/list?page=1&per_page=20&format=json&population=1000000"
  // "https://countries-cities.p.rapidapi.com/location/country/' . $_REQUEST['country'] . '/city/list?page=1&per_page=20&format=json&population=1000000",
curl_setopt_array($curl, array(
	CURLOPT_URL => "https://countries-cities.p.rapidapi.com/location/country/" . $_REQUEST['country'] . "/city/list?page=1&per_page=20&format=json&population=1000000",
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 30,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => array(
		"x-rapidapi-host: countries-cities.p.rapidapi.com",
		"x-rapidapi-key: ab4a937aedmsheab503ee147083ep1cf4c5jsn04c015fba7ff"
	),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
	echo "cURL Error #:" . $err;
} else {
	echo $response;
}
