var express     = require('express');
var app         = express();
var path        = require('path');
var bodyParser  = require('body-parser'); // Parse json present in http request

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: true
})); 

var port = process.env.PORT || 3000; 


app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization,type,mspId,certificate,privateKey,orgName,userName' );
  next();
}); 

require('./routes')(app);
app.listen(port, function () {
  console.log('App listening on port '+port+'!');
});


