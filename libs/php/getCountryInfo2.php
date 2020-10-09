<?php

	$executionStartTime = microtime(true) / 1000;

	$url='http://climatedataapi.worldbank.org/climateweb/rest/v1/country/mavg/bccr_bcm2_0/a2/pr/2020/2039/' . $_REQUEST['countryCode3'];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);

	$output['data']['rainfall'] = $decode;

	$url='http://climatedataapi.worldbank.org/climateweb/rest/v1/country/mavg/bccr_bcm2_0/a2/tas/2020/2039/' . $_REQUEST['countryCode3'];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);

	$output['data']['temperature'] = $decode;

	$url = 'https://api.globalhealth5050.org/api/v1/agesex?code=' . $_REQUEST['countryCode2'];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);
	$output['data']['demographics'] = $decode['data'];

	$url='http://api.geonames.org/timezoneJSON?formatted=true&lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=jherring_eng&style=full';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);
	$output['data']['time'] = $decode;

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";


	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);

?>
