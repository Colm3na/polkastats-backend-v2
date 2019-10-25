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
  // Get best block number
  //
  const bestNumber = await api.derive.chain.bestNumber();

  //
  // Outputs JSON
  //
  console.log(`bestNumber:`, bestNumber);
  
  //
  // Fetch active validators
  //
  const stakingValidators = await api.query.session.validators();
  //const validators = stakingValidators;


  console.log(`stakingValidators:`, stakingValidators)


  /* //
  // Map validator authorityId to staking info object
  //
  const validatorStaking = await Promise.all(
    validators.map(authorityId => api.derive.staking.info(authorityId))
  );

  //
  // Database conf
  //
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "polkastats",
    password: "polkastats",
    database: 'polkastats'
  });

  if (validatorStaking) {
    console.log(`block_height: ${bestNumber} intention: ${JSON.stringify(validatorStaking)}`);
    var sqlInsert = 'INSERT INTO validator_intention (block_height, timestamp, json) VALUES (\'' + bestNumber + '\', UNIX_TIMESTAMP(), \'' + JSON.stringify(validatorStaking) + '\');';
    let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
  } */

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());