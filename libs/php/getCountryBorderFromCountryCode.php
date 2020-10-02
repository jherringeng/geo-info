<?php

	// @param: countrycode (iso alpha 2)

	$executionStartTime = microtime(true);

	$countryCode = $_REQUEST['country'];

	$countryBorders = json_decode(file_get_contents("countryBorders.geo.json"), true);

	$border = null;

	foreach ($countryBorders['features'] as $feature) {

		if ($feature["properties"]['iso_a2'] == $countryCode) {

			$border = $feature;
			break;

		}

	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $border;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);

?>
