// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

const https = require('https');
const fs = require('fs');

var express = require('express');
var app = express();

var mysql = require('mysql');

// Local Polkadot node
var wsProviderUrl = 'ws://127.0.0.1:9944';

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

app.get('/system', async function (req, res) {
  
  // Connect to MySQL
  var con = mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: "polkastats",
  });

  // Get last state
  con.query('SELECT chain, client_name, client_version, timestamp FROM system WHERE 1 ORDER BY id DESC LIMIT 1;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows[0]);
  });

});

app.get('/chain', async function (req, res) {
  
  // Connect to MySQL
  var con = mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: "polkastats",
  });

  // Get last state
  con.query('SELECT block_height, session_json, timestamp FROM chain WHERE 1 ORDER BY id DESC LIMIT 1;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(JSON.parse(rows[0]));
  });

});


app.get('/session', async function (req, res) {
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  const provider = new WsProvider(wsProviderUrl);

  //
  // Create the API and wait until ready
  //
  const api = await ApiPromise.create(provider);

  //
  // Get session info
  //
  const session = await api.derive.session.info();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();

  //
  // Outputs JSON
  //
  res.json(session);

});

app.get('/bestblocknumber', async function (req, res) {
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  const provider = new WsProvider(wsProviderUrl);

  //
  // Create the API and wait until ready
  //
  const api = await ApiPromise.create(provider);

  //
  // Get best block number
  //
  const blockNumber = await api.derive.chain.bestNumber();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();

  //
  // Outputs JSON
  //
  res.json(blockNumber);

});


app.get('/validators', async function (req, res) {

  // Connect to MySQL
  var con = mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: "polkastats",
  });

  // Get last state
  con.query('SELECT json FROM validator WHERE 1 ORDER BY id DESC LIMIT 1;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(JSON.parse(rows[0]['json']));
  });

});


app.get('/intentions', async function (req, res) {

  // Connect to MySQL
  var con = mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: "polkastats",
  });

  // Get last state
  con.query('SELECT json FROM validator_intention WHERE 1 ORDER BY id DESC LIMIT 1;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(JSON.parse(rows[0]['json']));
  });

});


app.get('/validator/:accountId', async function (req, res) {
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  const provider = new WsProvider(wsProviderUrl);

  //
  // Create the API and wait until ready
  //
  const api = await ApiPromise.create(provider);

  //
  // Retrieve validator staking info
  //
  const validator = await api.derive.staking.info(req.params.accountId)

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();

  //
  // Outputs JSON
  //
  res.json(validator);

});

/* VALIDATOR GRAPHS */

app.get('/validator/graph/daily/:accountId', function (req, res, next) {

  // Connect to MySQL
  var con = mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: "polkastats",
  });

  // Last 24 hours
  con.query('SELECT id, accountId, timestamp, amount FROM validator_bonded WHERE accountId = \'' + req.params.accountId + '\' ORDER BY id DESC LIMIT 288;', function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });

});

app.get('/validator/graph/weekly/:accountId', function (req, res, next) {

  // Connect to MySQL
  var con = mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: "polkastats",
  });

  // Last 7 days
  con.query('SELECT id, accountId, timestamp, amount FROM validator_bonded WHERE accountId = \'' + req.params.accountId + '\' AND DATE_FORMAT(FROM_UNIXTIME(`timestamp`), "%d/%m/%Y %H:%i:%s") LIKE "%00:00:%" ORDER BY id DESC LIMIT 7;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });

});

app.get('/validator/graph/monthly/:accountId', function (req, res, next) {

  // Connect to MySQL
  var con = mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: "polkastats",
  });

  // Last month (30 days)
  con.query('SELECT id, accountId, timestamp, amount FROM validator_bonded WHERE accountId = \'' + req.params.accountId + '\' AND DATE_FORMAT(FROM_UNIXTIME(`timestamp`), "%d/%m/%Y %H:%i:%s") LIKE "%00:00:%" ORDER BY id DESC LIMIT 720;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });

});

/* INTENTION GRAPHS */

app.get('/intention/graph/daily/:accountId', function (req, res, next) {

  // Connect to MySQL
  var con = mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: "polkastats",
  });

  // Last 24 hours
  con.query('SELECT id, accountId, timestamp, amount FROM validator_bonded WHERE accountId = \'' + req.params.accountId + '\' ORDER BY id DESC LIMIT 288;', function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });

});

app.get('/intention/graph/weekly/:accountId', function (req, res, next) {

  // Connect to MySQL
  var con = mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: "polkastats",
  });

  // Last 7 days
  con.query('SELECT id, accountId, timestamp, amount FROM validator_bonded WHERE accountId = \'' + req.params.accountId + '\' AND DATE_FORMAT(FROM_UNIXTIME(`timestamp`), "%d/%m/%Y %H:%i:%s") LIKE "%00:00:%" ORDER BY id DESC LIMIT 7;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });

});

app.get('/intention/graph/monthly/:accountId', function (req, res, next) {

  // Connect to MySQL
  var con = mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: "polkastats",
  });

  // Last month (30 days)
  con.query('SELECT id, accountId, timestamp, amount FROM validator_bonded WHERE accountId = \'' + req.params.accountId + '\' AND DATE_FORMAT(FROM_UNIXTIME(`timestamp`), "%d/%m/%Y %H:%i:%s") LIKE "%00:00:%" ORDER BY id DESC LIMIT 720;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });

});


/* app.get('/offline', async function (req, res) {
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  const provider = new WsProvider(wsProviderUrl);

  //
  // Create the API and wait until ready
  //
  const api = await ApiPromise.create(provider);

  //
  // Get validator outages
  //
  const offlineEvents = await api.query.staking.recentlyOffline();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();

  //
  // Outputs JSON
  //
  res.json(offlineEvents);

}); */

// SSL certificate files
const privateKey = fs.readFileSync('/etc/letsencrypt/live/polkastats.io/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/polkastats.io/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/polkastats.io/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// Starting https server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(8443, () => {
	console.log('HTTPS Server running on port 8443');
});
