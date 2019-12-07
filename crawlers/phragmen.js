// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Promise MySQL lib
const mysql = require('mysql2/promise');

const { exec } = require('child_process');

// Import config params
const {
  wsProviderUrl,
  mysqlConnParams
} = require('../backend.config');

async function main () {

  //
  // Database connection
  //
  const conn = await mysql.createConnection(mysqlConnParams);
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  const provider = new WsProvider(wsProviderUrl);

  // Create the API and wait until ready
  const api = await ApiPromise.create(provider);

  //
  // Get block height, total issuance and session info
  //

  const [validatorCount, minimumValidatorCount] = await Promise.all([
    api.query.staking.validatorCount(),
    api.query.staking.minimumValidatorCount()
  ]);

  // console.log(validatorCount);
  // console.log(minimumValidatorCount);

  
  exec(`/usr/local/mario-offline-phragmen/target/release/offline-phragmen -c ${validatorCount} -m ${minimumValidatorCount}`, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });

//   if (blockHeight && session && totalIssuance) {
//     console.log(`block_height: ${blockHeight} block_height_finalized: ${blockHeightFinalized} session: ${JSON.stringify(session)} total_issuance: ${totalIssuance}`);
//     var sqlInsert = 'INSERT INTO chain (block_height, block_height_finalized, session_json, total_issuance, timestamp) VALUES (\'' + blockHeight + '\', \'' + blockHeightFinalized + '\', \'' + JSON.stringify(session) + '\', \'' + totalIssuance + '\', UNIX_TIMESTAMP());';
//     let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
//   }

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());