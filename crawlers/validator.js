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
  // Get best block number, active validators, imOnline data, current elected and current era points earned
  //
  const [bestNumber, validators, imOnline, currentElected, currentEraPointsEarned] = await Promise.all([
    api.derive.chain.bestNumber(),
    api.query.session.validators(),
    api.derive.imOnline.receivedHeartbeats(),
    api.query.staking.currentElected(),
    api.query.staking.currentEraPointsEarned()
  ]);
  

  //
  // Map validator authorityId to staking info object
  //
  const validatorStaking = await Promise.all(
    validators.map(authorityId => api.derive.staking.info(authorityId))
  );

  //
  // Add imOnline property to validator object
  //
  validatorStaking.forEach(function (validator) {
    if (imOnline[validator.accountId]) {
      validator.imOnline = imOnline[validator.accountId];
    }
  }, imOnline);

  //
  // Add current elected and earned era points to validator object
  //
  validatorStaking.forEach(function (validator) {
    if (currentElected[validator.accountId]) {
      validator.currentElected = true;
    } else {
      validator.currentElected = false;
    }
    if (currentEraPointsEarned[currentElected.indexOf(validator.accountId)]) {
      validator.currentEraPointsEarned = currentEraPointsEarned[currentElected.indexOf(validator.accountId)];
    }
  }, currentElected);

  if (validatorStaking) {
    console.log(`validators:`, JSON.stringify(validatorStaking, null, 2));
    var sqlInsert = 'INSERT INTO validator (block_height, timestamp, json) VALUES (\'' + bestNumber + '\', UNIX_TIMESTAMP(), \'' + JSON.stringify(validatorStaking) + '\');';
    let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
  }

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());