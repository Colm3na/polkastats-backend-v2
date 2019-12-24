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

  // Database connection
  const conn = await mysql.createConnection(mysqlConnParams);
  
  // Initialise the provider to connect to the local polkadot node
  const provider = new WsProvider(wsProviderUrl);

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });
  
  // Fetch active accounts
  const accounts = await api.derive.accounts.indexes();

  // Log active accounts
  console.log(JSON.stringify(accounts, null, 2));

  // Main loop
  for (var key in accounts ) {
    if (accounts.hasOwnProperty(key)) {
      // console.log(key + " -> " + accounts[key]);
      let sql = `SELECT accountId, accountIndex FROM account_index WHERE accountId = "${key}"`;
      let [rows, fields] = await conn.execute(sql, [2, 2]);
      console.log(rows);
      console.log(`accountIndex:`, rows.accountIndex);
      if (rows.length > 0) {
        if (rows[0].accountIndex !== accounts[key]) {
          console.log("Updating account index: " + key + " -> " + accounts[key]);
          sql = `UPDATE account_index SET accountIndex = "${accounts[key]}" WHERE accountId = "${key}"`;
          await conn.execute(sql, [2, 2]);
        }
      } else {
        console.log("New account index: " + key + " -> " + accounts[key]);
        sql = 'INSERT INTO account_index (accountId, accountIndex) VALUES (\'' + key + '\', \'' + accounts[key] + '\');';
        await conn.execute(sql, [2, 2]);
      }
    }
  }

  conn.end();
}

main().catch(console.error).finally(() => process.exit());