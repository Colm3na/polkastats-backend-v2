// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Promise MySQL lib
const mysql = require('mysql2/promise');

// Local Polkadot node
var wsProviderUrl = 'ws://127.0.0.1:9944';

async function main () {
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  const provider = new WsProvider(wsProviderUrl);

  // Create the API and wait until ready
  const api = await ApiPromise.create(provider);

  //
  // Get block height
  //
  const blockHeight = await api.derive.chain.bestNumber();

  //
  // Get session info
  //
  const session = await api.derive.session.info();

  //
  // Database conf
  //
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: 'polkastats'
  });

  if (blockHeight && session) {
    console.log(`block_height: ${blockHeight} session: ${JSON.stringify(session)}`);
    var sqlInsert = 'INSERT INTO chain (block_height, session_json, timestamp) VALUES (\'' + blockHeight + '\', \'' + JSON.stringify(session) + '\', UNIX_TIMESTAMP());';
    let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
  }

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());