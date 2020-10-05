<?php

	$executionStartTime = microtime(true) / 1000;

	$url='http://api.geonames.org/countryInfoJSON?formatted=true&lang=en&country=' . $_REQUEST['country'] . '&username=jherring_eng&style=full';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);

	$output['data']['countryInfo'] = $decode['geonames'][0];
	$north = $output['data']['countryInfo']['north'];
	$south = $output['data']['countryInfo']['south'];
	$east = $output['data']['countryInfo']['east'];
	$west = $output['data']['countryInfo']['west'];


	$executionStartTime = microtime(true) / 1000;

	$url='http://api.geonames.org/earthquakesJSON?north=' . $north . '&south=' . $south . '&east='.$east . '&west=' . $west . '&username=jherring_eng';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);

	$output['data']['earthquakes'] = $decode['earthquakes'];

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);

?>
