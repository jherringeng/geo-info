<?php

	$executionStartTime = microtime(true) / 1000;

	$url='http://api.worldbank.org/v2/country/' . $_REQUEST['country'] . '/indicator/NY.GDP.MKTP.CD?format=json';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);

	$output['data']['gdp'] = $decode;

	$url='http://api.worldbank.org/v2/country/' . $_REQUEST['country'] . '/indicator/SL.GDP.PCAP.EM.KD?format=json';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);

	$output['data']['gdpPerson'] = $decode;

	$url='http://api.worldbank.org/v2/country/' . $_REQUEST['country'] . '/indicator/NY.GDP.MKTP.KD.ZG?format=json';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);

	$output['data']['gdpGrowth'] = $decode;

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);

?>
