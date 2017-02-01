/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

var https = require("https");
app.get("/meteo", function(request, response) {
	console.log("Demande ma météo pour " + request.query.latitude + ", " + request.query.longitude);
	var options = {
		host: "twcservice.mybluemix.net",
		method: "GET",
		path: "/api/weather/v1/geocode/" + request.query.latitude + "/" + request.query.longitude + "/observations.json?language=fr-FR&units=m",
		auth:"744fd58c-9555-4c34-8f86-a915f1651208:ibTP99RDM9"
	};

	https.get(options, function(httpsResponse) {
		var twcData = "";
		httpsResponse.on("data", function(chunck) {
			twcData += chunck;
		});
		httpsResponse.on("end", function() {
			var twcResponse = JSON.parse(twcData);

			var body = "Station d'observation: " + twcResponse.observation.obs_name + "\n";
			body += "Température: " + twcResponse.observation.temp + "°C" + "\n";
			body += "Pression: " + twcResponse.observation.pressure_desc + "\n";
			body += "Point de rosée: " + twcResponse.observation.dewPt + "°C" + "\n";
			body += "Humidité relative: " + twcResponse.observation.rh + "%" + "\n";
			body += "Pression: " + twcResponse.observation.pressure + " mb" + "\n";
			if (twcResponse.observation.vis == 999) {
				body += "Visibilité: maximale" + "\n";
			} else {
				body += "Visibilité: " + twcResponse.observation.vis + "\n";
			}

			response.set('Content-Type', 'text/plain');
			response.send(body);
			response.end();

		});
	});

});


// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
