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
  // Fetch active and intention validator list
  //
  const validators = await api.query.staking.validators();

  //
  // Map validator authorityId to account info object
  //
  const validatorNicknames = await Promise.all(
    validators[0].map(authorityId => api.derive.accounts.info(authorityId))
  );

  if (validatorNicknames.length > 0) {
    for (var i = 0; i < validatorNicknames.length; i++) {
      let account = validatorNicknames[i];
      if (account.nickname){
        console.log(JSON.stringify(account));
        var sqlInsert = 'INSERT INTO account_nickname (accountId, nickname) VALUES (\'' + account.accountId + '\', \'' + account.nickname + '\');';
        let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
      }      
    }
  }

  conn.end();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());