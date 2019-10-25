// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Promise MySQL lib
const mysql = require('mysql2/promise');

// Local Polkadot node
const wsProviderUrl = 'ws://127.0.0.1:9944';

async function main () {

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
  // Database conf
  //
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: 'polkastats'
  });

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
}

main().catch(console.error).finally(() => process.exit());