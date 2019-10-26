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
  // Fetch intention validators
  //
  const stakingValidators = await api.query.staking.validators();
  const validators = stakingValidators[0];

  if (validators && validators.length > 0) {

    // Map staking stats to validators
    const validatorStaking = await Promise.all(
      validators.map(authorityId => api.derive.staking.info(authorityId))
    );

    //
    // Connect to MySQL database
    //
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "polkastats",
      password: "polkastats",
      database: 'polkastats'
    });

    for (var i = 0; i < validatorStaking.length; i++) {
      //console.log(validatorStaking[i]);
      var sqlInsert = "INSERT INTO validator_intention_bonded (accountId, timestamp, amount) VALUES ('" + validatorStaking[i].accountId + "', UNIX_TIMESTAMP(), '" + validatorStaking[i].stakingLedger.active + "');";
      let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
    }
  }
}

main().catch(console.error).finally(() => process.exit());