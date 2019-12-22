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
  // Fetch intention validators
  //
  const stakingValidators = await api.query.staking.validators();
  const validators = stakingValidators[0];

  if (validators && validators.length > 0) {

    // Map staking stats to validators
    const validatorStaking = await Promise.all(
      validators.map(authorityId => api.derive.staking.info(authorityId))
    );

    for (var i = 0; i < validatorStaking.length; i++) {
      //console.log(validatorStaking[i]);
      var sqlInsert = "INSERT INTO intention_bonded (accountId, timestamp, amount, json) VALUES ('" + validatorStaking[i].accountId + "', UNIX_TIMESTAMP(), '" + validatorStaking[i].stakingLedger.active + "', '" + JSON.stringify(validatorStaking[i]) + "');";
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