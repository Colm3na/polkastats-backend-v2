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
  for(let i = 0; i < validatorStaking.length; i++) {
    let validator = validatorStaking[i];
    if (Number.isInteger(currentElected.indexOf(validator.accountId))) {
      validator.currentElected = true;
    } else {
      validator.currentElected = false;
    }
    if (currentEraPointsEarned.individual[currentElected.indexOf(validator.accountId)]) {
      validator.currentEraPointsEarned = currentEraPointsEarned.individual[currentElected.indexOf(validator.accountId)];
    }
  }

  if (validatorStaking) {
    console.log(`validators:`, JSON.stringify(validatorStaking, null, 2));
    var sqlInsert = 'INSERT INTO validator (block_height, timestamp, json) VALUES (\'' + bestNumber + '\', UNIX_TIMESTAMP(), \'' + JSON.stringify(validatorStaking) + '\');';
    let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
  }
  
  conn.end();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());