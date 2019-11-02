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
  const conn = await mysql.createConnection(mysqlConnParams);
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  const provider = new WsProvider(wsProviderUrl);

  // Create the API and wait until ready
  const api = await ApiPromise.create(provider);
  
  //
  // Fetch active and intention validator list
  //
  const validators = await api.query.staking.validators();

  //
  // Map validator authorityId to account info info object
  //
  const validatorNickname = await Promise.all(
    validators.map(authorityId => api.derive.accounts.info(authorityId))
  );

  console.log(`nicknames:`, JSON.stringify(validatorNickname));

  if (validatorNickname) {
    console.log(`nicknames: ${JSON.stringify(validatorNickname)}`);
    // var sqlInsert = 'INSERT INTO validator (block_height, timestamp, json) VALUES (\'' + bestNumber + '\', UNIX_TIMESTAMP(), \'' + JSON.stringify(validatorStaking) + '\');';
    // let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
  }

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());