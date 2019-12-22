// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Promise MySQL lib
const mysql = require('mysql2/promise');

const { spawnSync } = require( 'child_process' );


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
  const api = await ApiPromise.create({ provider });

  //
  // Get block height, total issuance and session info
  //

  const [validatorCount, minimumValidatorCount] = await Promise.all([
    api.query.staking.validatorCount(),
    api.query.staking.minimumValidatorCount()
  ]);

  // console.log(validatorCount.toString());
  // console.log(minimumValidatorCount.toString());

  const phragmenCmd = spawnSync( '/usr/local/mario-offline-phragmen/target/release/offline-phragmen', [ '-c', validatorCount.toString(), '-m', minimumValidatorCount.toString() ] );
  
  // console.log( `stderr: ${phragmenCmd.stderr.toString()}` );
  // console.log( `stdout: ${phragmenCmd.stdout.toString()}` );
  
  const phragmen = phragmenCmd.stdout.toString();

  if (phragmen) {
    // console.log(`phragmen: ${phragmen}`);
    var sqlInsert = 'INSERT INTO phragmen (phragmen_json, timestamp) VALUES (\'' + phragmen + '\', UNIX_TIMESTAMP());';
    let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
  }

  conn.end();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());