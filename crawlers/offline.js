// @ts-check
// Required imports
const { ApiPromise } = require('@polkadot/api');

// Promise MySQL lib
const mysql = require('mysql2/promise');

// Import config params
const {
  mysqlConnParams
} = require('../backend.config');

async function main () {

  //
  // Database connection
  //
  const conn = await mysql.createConnection(mysqlConnParams);

  //
  // Create API with a default connection to the local node
  //
  const api = await ApiPromise.create();

  //
  // Get validator outages
  //
  const offlineEvents = await api.derive.staking.recentlyOffline();

  if (offlineEvents && offlineEvents.length > 0) {
    for (var i = 0; i < offlineEvents.length; i++) {

      console.log(`accountId: ${offlineEvents[i][0]} block_height: ${offlineEvents[i][1]} times: ${offlineEvents[i][2]}`);
      var sql = 'SELECT id FROM validator_offline WHERE accountId = \'' + offlineEvents[i][0] + '\' AND block_height = \'' + offlineEvents[i][1] + '\' AND times = \'' + offlineEvents[i][2] + '\';';

      // Search for offline event in db, insert it if not found
      let [rows, fields] = await conn.execute(sql, [2, 2]);
      if (rows.length == 0) {
        var sqlInsert = 'INSERT INTO validator_offline (accountId, block_height, times) VALUES (\'' + offlineEvents[i][0] + '\', \'' + offlineEvents[i][1] + '\', \'' + offlineEvents[i][2] + '\');';
        let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
      }
    }
  }
  
  conn.end();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());