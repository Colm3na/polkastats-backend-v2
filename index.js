// @ts-check
// Required imports
const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express();
const mysql = require('mysql');

const {
  backendPort,
  enableCORS,
  mysqlConnParams
} = require('./backend.config')

// MySQL database connection
const con = mysql.createConnection(mysqlConnParams);

// CORS
if (enableCORS) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
  });
}

app.get('/system', async function (req, res) {
  // Get last state
  con.query('SELECT chain, client_name, client_version, timestamp FROM system WHERE 1 ORDER BY id DESC LIMIT 1;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows[0]);
  });
});

app.get('/chain', async function (req, res) {
  // Get last state
  con.query('SELECT block_height, block_height_finalized, session_json, total_issuance, timestamp FROM chain WHERE 1 ORDER BY id DESC LIMIT 1;', function(err, rows, fields) {
    if (err) throw err;  
    res.json({
      block_height: rows[0]['block_height'],
      block_height_finalized: rows[0]['block_height_finalized'],
      session: JSON.parse(rows[0]['session_json']),
      total_issuance: rows[0]['total_issuance']
    });
  });
});


app.get('/validators', async function (req, res) {
  // Get last state
  con.query('SELECT json FROM validator WHERE 1 ORDER BY id DESC LIMIT 1;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(JSON.parse(rows[0]['json']));
  });
});


app.get('/intentions', function (req, res) {
  // Get last state
  var intentions =  null
  var validators = null
  con.query('SELECT json FROM validator_intention WHERE 1 ORDER BY id DESC LIMIT 1; SELECT json FROM validator WHERE 1 ORDER BY id DESC LIMIT 1;', [2, 1], function(err, rows, fields) {
    if (err) throw err;

    intentions = JSON.parse(rows[0][0]['json'])
    validators = JSON.parse(rows[1][0]['json'])

    // console.log(`intentions`, intentions)
    // console.log(`validators`, validators)

    if (validators && intentions) {
      res.json(subtractValidatorsFromIntentions(validators, intentions));
    }

  });
});


app.get('/identities', async function (req, res) {
  // Get last state
  con.query('SELECT stashId, username, username_cased, full_name, location, bio, logo, website, twitter, github, created, updated FROM keybase_identity WHERE 1 ORDER BY id ASC;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });
});

app.get('/nicknames', async function (req, res) {
  // Get last state
  con.query('SELECT accountId, nickname FROM account_nickname WHERE 1 ORDER BY id ASC;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });
});

app.get('/phragmen', async function (req, res) {
  // Get last state
  con.query('SELECT phragmen_json FROM phragmen WHERE 1 ORDER BY id DESC LIMIT 1;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(JSON.parse(rows[0]['phragmen_json']));
  });
});


/* EVENTS */

// Get last 5,000 events
app.get('/events', async function (req, res) {
  // Get last state
  con.query('SELECT blockNumber, eventIndex, section, method, phase, data FROM event WHERE section != "system" ORDER BY id DESC LIMIT 5000;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });
});

/* ACCOUNT INDEXES */

// Get all active accounts indexes
app.get('/indexes', async function (req, res) {
  // Get last state
  con.query('SELECT accountId, accountIndex FROM account_index WHERE 1 ORDER BY id DESC;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });
});

/* ACCOUNTS */

// Get all active accounts indexes
app.get('/accounts', async function (req, res) {
  // Get last state
  con.query('SELECT accountId, accountIndex, nickname, identity, balances FROM account WHERE 1;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });
});

/* IDENTITIES FOR ALL ACCOUNTS INVOLVED IN STAKING (VALIDATORS, INTENTIONS AND NOMINATORS) */
app.get('/staking_identities', async function (req, res) {
  // Get last state
  con.query('SELECT accountId, identity FROM account_identity WHERE 1 ORDER BY id DESC;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });
});

/* VALIDATOR GRAPHS */

app.get('/validator/graph/daily/:accountId', function (req, res, next) {
  // Last 24 hours
  con.query('SELECT id, accountId, timestamp, amount FROM validator_bonded WHERE accountId = \'' + req.params.accountId + '\' ORDER BY id DESC LIMIT 288;', function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/validator/graph/weekly/:accountId', function (req, res, next) {
  // Last 7 days
  con.query('SELECT id, accountId, timestamp, amount FROM validator_bonded WHERE accountId = \'' + req.params.accountId + '\' AND DATE_FORMAT(FROM_UNIXTIME(`timestamp`), "%d/%m/%Y %H:%i:%s") LIKE "%00:00:%" ORDER BY id DESC LIMIT 7;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });
});

app.get('/validator/graph/monthly/:accountId', function (req, res, next) {
  // Last month (30 days)
  con.query('SELECT id, accountId, timestamp, amount FROM validator_bonded WHERE accountId = \'' + req.params.accountId + '\' AND DATE_FORMAT(FROM_UNIXTIME(`timestamp`), "%d/%m/%Y %H:%i:%s") LIKE "%00:00:%" ORDER BY id DESC LIMIT 30;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });
});

/* INTENTION GRAPHS */

app.get('/intention/graph/daily/:accountId', function (req, res, next) {
  // Last 24 hours
  con.query('SELECT id, accountId, timestamp, amount FROM intention_bonded WHERE accountId = \'' + req.params.accountId + '\' ORDER BY id DESC LIMIT 288;', function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/intention/graph/weekly/:accountId', function (req, res, next) {
  // Last 7 days
  con.query('SELECT id, accountId, timestamp, amount FROM intention_bonded WHERE accountId = \'' + req.params.accountId + '\' AND DATE_FORMAT(FROM_UNIXTIME(`timestamp`), "%d/%m/%Y %H:%i:%s") LIKE "%00:00:%" ORDER BY id DESC LIMIT 7;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });
});

app.get('/intention/graph/monthly/:accountId', function (req, res, next) {
  // Last month (30 days)
  con.query('SELECT id, accountId, timestamp, amount FROM intention_bonded WHERE accountId = \'' + req.params.accountId + '\' AND DATE_FORMAT(FROM_UNIXTIME(`timestamp`), "%d/%m/%Y %H:%i:%s") LIKE "%00:00:%" ORDER BY id DESC LIMIT 30;', function(err, rows, fields) {
    if (err) throw err;  
    res.json(rows);
  });
});


// Start http server
const httpServer = http.createServer(app);
httpServer.listen(backendPort, () => {
	console.log(`PolkaStats v2 Backend HTTP RPC running on port ${backendPort}`);
});


function validatorIsEqual (a, b) {
  return a.accountId === b.accountId
}

function subtractValidatorsFromIntentions(validators, intentions) {
  var filteredIntentions = [];
  intentions.forEach((intention) => {
    var found = false;
    validators.forEach((validator) => {
      if (validatorIsEqual(validator, intention)) {
        found = true;
      }  
    });
    if (!found) {
      filteredIntentions.push(intention);
    }
  })
  return filteredIntentions;
}
