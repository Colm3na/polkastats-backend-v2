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
  // Get block height, total issuance and session info
  //

  const [blockHeight, blockHeightFinalized, totalIssuance, session] = await Promise.all([
    api.derive.chain.bestNumber(),
    api.derive.chain.bestNumberFinalized(), 
    api.query.balances.totalIssuance(),
    api.derive.session.info()
  ]);

  if (blockHeight && session && totalIssuance) {
    console.log(`block_height: ${blockHeight} block_height_finalized: ${blockHeightFinalized} session: ${JSON.stringify(session)} total_issuance: ${totalIssuance}`);
    var sqlInsert = 'INSERT INTO chain (block_height, block_height_finalized, session_json, total_issuance, timestamp) VALUES (\'' + blockHeight + '\', \'' + blockHeightFinalized + '\', \'' + JSON.stringify(session) + '\', \'' + totalIssuance + '\', UNIX_TIMESTAMP());';
    let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
  }

  conn.end();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());