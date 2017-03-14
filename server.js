const express = require('express');
var methodOverride = require('method-override');
const app = express();
const logger = require("morgan");
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;


// Morgan and body-parser
app.use(logger("dev"));
app.use(bodyParser.urlencoded({'extended':'false'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override'));

//require routes
require('./app/routes/routes.js')(app);


// Serve static content for the app from the "app" directory
app.use(express.static(__dirname + "/app"));

app.listen(PORT, function(){
   console.log("listening on " + PORT);
});

