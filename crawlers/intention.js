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
  // Get best block number
  //
  const bestNumber = await api.derive.chain.bestNumber();

  //
  // Outputs JSON
  //
  console.log(`block_height: ${bestNumber}`);
  
  //
  // Fetch intention validators
  //
  const stakingValidators = await api.query.staking.validators();
  const validators = stakingValidators[0];

  // Fetch all stash addresses for current session (including validators and intentions)
  const allStashAddresses = await api.derive.staking.stashes();

  // Fetch active validator addresses for current session.
  const validatorAddresses = await api.query.session.validators();

  // Fetch intention addresses for current session.
  const intentionAddresses = allStashAddresses.filter(address => !validatorAddresses.includes(address));

  //
  // Map validator authorityId to staking info object
  //
  const intentionStaking = await Promise.all(
    intentionAddresses.map(authorityId => api.derive.staking.account(authorityId))
  );

  //
  // Add hex representation of sessionId[] and nextSessionId[]
  //
  for(let i = 0; i < intentionStaking.length; i++) {
    let validator = intentionStaking[i];
    if (validator.sessionIds.length > 0) {
      validator.sessionIdHex = validator.sessionIds.toHex();
    }
    if (validator.nextSessionIds.length > 0) {
      validator.nextSessionIdHex = validator.nextSessionIds.toHex();
    }
  }

  if (intentionStaking) {
    console.log(`intentions: ${JSON.stringify(intentionStaking, null, 2)}`);
    var sqlInsert = 'INSERT INTO validator_intention (block_height, timestamp, json) VALUES (\'' + bestNumber + '\', UNIX_TIMESTAMP(), \'' + JSON.stringify(intentionStaking) + '\');';
    let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
  }

  conn.end();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());