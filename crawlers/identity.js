//
// Return identity of all validator, intention and nominator accounts
//
// This way we serve only the identities we need to display in all 
// places except in active accounts, where we need the full list 
//

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

  //
  // Get nominators
  //
  const validatorStaking = await Promise.all(
    validatorAddresses.map(authorityId => api.derive.staking.account(authorityId))
  );

  let nominators = [];
  for(let i = 0; i < validatorStaking.length; i++) {
    let validator = validatorStaking[i];
    if (validator.exposure.others.length > 0) {
      for (let j = 0; j < validator.exposure.others.length; j++) {
        let nominator = validator.exposure.others[j];
        nominators.push(nominator.who)
      }
    }
  }

  let accounts = nominators.concat(validatorAddresses, intentionAddresses);
  
  // console.log(`accounts:`, JSON.stringify(accounts, null, 2));

  //
  // Get accountInfo
  //
  const accountInfo = await Promise.all(
    accounts.map(accountId => api.derive.accounts.info(accountId))
  );

  // console.log(`accountInfo:`, JSON.stringify(accountInfo, null, 2));

  let stakingAccountsInfo = []
  accountInfo.forEach(account => {
    if (account.identity.display) {
      stakingAccountsInfo[account.accountId.toString()] = account;
    }
  });

  // console.log(`stakingAccountsInfo:`, JSON.stringify(stakingAccountsInfo, null, 2));
  // console.log(`stakingAccountsInfo num:`, stakingAccountsInfo.length);

  // Main loop
  for (var key in stakingAccountsInfo ) {
    if (stakingAccountsInfo.hasOwnProperty(key)) {
      // console.log(key + " -> " + stakingAccountsInfo[key]);
      let sql = `SELECT accountId FROM account_identity WHERE accountId = "${key}"`;
      let [rows, fields] = await conn.execute(sql, [2, 2]);
      if (rows.length > 0) {
        console.log(`Updating account_identity: accountId: ${key} identity: ${JSON.stringify(stakingAccountsInfo[key].identity, null, 2)}`);
        sql = `UPDATE account SET identity = '${JSON.stringify(stakingAccountsInfo[key].identity)}' WHERE accountId = '${key}'`;
        await conn.execute(sql, [2, 2]);
      } else {
        console.log(`New account_identity: accountId: ${key} identity: ${JSON.stringify(stakingAccountsInfo[key].identity, null, 2)}`);
        sql = `INSERT INTO account_identity (accountId, identity) VALUES ('${key}', '${JSON.stringify(stakingAccountsInfo[key].identity)}');`;
        await conn.execute(sql, [2, 2]);
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
