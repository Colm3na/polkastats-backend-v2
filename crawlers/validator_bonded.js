// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Promise MySQL lib
const mysql = require('mysql2/promise');

// Import config params
const {
  wsProviderUrl,
  mysqlConnParams
} = require('./backend.config');

async function main () {

  //
  // Database connection
  //
  const conn = await mysql.createConnection(mysqlConnParams);
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  const provider = new WsProvider(wsProviderUrl);

  //
  // Create the API and wait until ready
  //
  const api = await ApiPromise.create(provider);
  
  //
  // Fetch active validators
  //
  const validators = await api.query.session.validators()

  if (validators && validators.length > 0) {

    // Map staking stats to validators
    const validatorStaking = await Promise.all(
      validators.map(authorityId => api.derive.staking.info(authorityId))
    );

    for (var i = 0; i < validatorStaking.length; i++) {
      //console.log(validatorStaking[i]);
      var bonded = 0;
      if (validatorStaking[i].stakers.hasOwnProperty(`total`)) {
        bonded = validatorStaking[i].stakers.total
      }
      var sqlInsert = "INSERT INTO validator_bonded (accountId, timestamp, amount) VALUES ('" + validatorStaking[i].accountId + "', UNIX_TIMESTAMP(), '" + bonded + "');";
      let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
    }
  }
}

main().catch(console.error).finally(() => process.exit());