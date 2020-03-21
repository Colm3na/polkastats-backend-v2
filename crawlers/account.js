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

  // Database connection
  const conn = await mysql.createConnection(mysqlConnParams);
  
  // Initialise the provider to connect to the local polkadot node
  const provider = new WsProvider(wsProviderUrl);

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });
  
  // Fetch active accounts
  const accountKeys = await api.query.system.account.keys();
  const accounts = accountKeys.map(key => key.args[0].toHuman());

  await accounts.forEach(async accountId => {

    let accountInfo = await api.derive.accounts.info(accountId);
    let identity = accountInfo.identity.display ? JSON.stringify(accountInfo.identity) : '';
    let balances = await api.derive.balances.all(accountId);
    
    console.log(`Processing account ${accountId}`);

    let sql = `SELECT accountId FROM account WHERE accountId = "${accountId}"`;
    let [rows, fields] = await conn.execute(sql, [2, 2]);
    if (rows.length > 0) {
      console.log(`Updating account: accountId: ${accountId} identity: ${identity} balances: ${JSON.stringify(balances)}`);
      sql = `UPDATE account SET accountIndex = '', nickname = '', identity = '${identity}', balances = '${JSON.stringify(balances)}' WHERE accountId = '${accountId}'`;
      await conn.execute(sql, [2, 2]);
    } else {
      console.log(`New account: accountId: ${accountId} identity: ${identity} balances: ${JSON.stringify(balances)}`);
      sql = `INSERT INTO account (accountId, accountIndex, nickname, identity, balances) VALUES ('${accountId}', '', '', '${identity}', '${JSON.stringify(balances)}');`;
      await conn.execute(sql, [2, 2]);
    }
    
  });

  conn.end();
}

main().catch(console.error).finally(() => process.exit());