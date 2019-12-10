// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Promise MySQL lib
const mysql = require('mysql2/promise');

// Import config params
const {
  wsProviderUrl,
  mysqlConnParams
} = require('../backend.config');

async function main () {

  //
  // Database connection
  //
  // const conn = await mysql.createConnection(mysqlConnParams);
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  const provider = new WsProvider(wsProviderUrl);

  // Create the API and wait until ready
  const api = await ApiPromise.create(provider);

  //
  // Get block height, total issuance and session info
  //

  // Subscribe to system events via storage
  await api.query.system.events((events) => {
    console.log('----- Received ' + events.length + ' event(s): -----');
    // loop through the Vec<EventRecord>
    events.forEach((record) => {
      console.log(JSON.stringify(record, null, 2));
    });
  });

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  // provider.disconnect();
}

// main().catch(console.error).finally(() => process.exit());