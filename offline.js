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
    user: "stats",
    password: "stats",
    database: 'validators'
  });

  //console.log(con);

  if (offlineEvents && offlineEvents.length > 0) {

    //console.log(JSON.stringify(offlineEvents));
    
    for (var i = 0; i < offlineEvents.length; i++) {

      // ["5GnNQbHMgBrENud2k3CkbGBB4Z5uNuR6Y1R2z7amXYv8yLMp",2347862,1]
      console.log(`accountId: ${offlineEvents[i][0]} blocknumber: ${offlineEvents[i][1]} times: ${offlineEvents[i][2]}`);

      var sql = 'SELECT id FROM offline WHERE accountId = \'' + offlineEvents[i][0] + '\' AND blocknumber = \'' + offlineEvents[i][1] + '\' AND times = \'' + offlineEvents[i][2] + '\';';

      // Search for offline event in db, insert it if not found
      let [rows, fields] = await conn.execute(sql, [2, 2]);
      if (rows.length == 0) {
        var sqlInsert = 'INSERT INTO offline (accountId, blocknumber, times) VALUES (\'' + offlineEvents[i][0] + '\', \'' + offlineEvents[i][1] + '\', \'' + offlineEvents[i][2] + '\');';
        let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
      }
      //console.log('rows: ' + rows);

    }
  }
}

main().catch(console.error).finally(() => process.exit());