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
  
  // Fetch all stash addresses for current session (including validators and intentions)
  const allStashAddresses = await api.derive.staking.stashes();

  // Fetch active validator addresses for current session.
  const validatorAddresses = await api.query.session.validators();

  // Fetch intention addresses for current session.
  const intentionAddresses = allStashAddresses.filter(address => !validatorAddresses.includes(address));

  if (intentionAddresses && intentionAddresses.length > 0) {

    // Map staking stats to validators
    const intentionStaking = await Promise.all(
      intentionAddresses.map(authorityId => api.derive.staking.account(authorityId))
    );

    for (var i = 0; i < intentionStaking.length; i++) {
      //console.log(intentionStaking[i]);
      var sqlInsert = "INSERT INTO intention_bonded (accountId, timestamp, amount, json) VALUES ('" + intentionStaking[i].accountId + "', UNIX_TIMESTAMP(), '" + intentionStaking[i].stakingLedger.active + "', '" + JSON.stringify(intentionStaking[i]) + "');";
      let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
    }
  }
  
  conn.end();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());