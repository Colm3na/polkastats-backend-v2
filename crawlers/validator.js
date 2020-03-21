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
  const api = await ApiPromise.create({ provider });

  //
  // Get best block number, active validators, imOnline data, current elected and current era points earned
  //
  const [bestNumber, validators, imOnline, currentEraPointsEarned] = await Promise.all([
    api.derive.chain.bestNumber(),
    api.query.session.validators(),
    api.derive.imOnline.receivedHeartbeats(),
    api.query.staking.currentEraPointsEarned()
  ]);
  

  //
  // Map validator authorityId to staking info object
  //
  const validatorStaking = await Promise.all(
    validators.map(authorityId => api.derive.staking.account(authorityId))
  );

  //
  // Add hex representation of sessionId[] and nextSessionId[]
  //
  validatorStaking.forEach(validator => {
    validator.sessionIdHex = validator.sessionIds.length !== 0 ? validator.sessionIds.toHex() : ``;
    validator.nextSessionIdHex = validator.nextSessionIds.length !== 0 ? validator.nextSessionIds.toHex() : ``;
  })

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
    validator.currentElected = true;
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