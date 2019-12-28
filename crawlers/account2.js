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
  const accounts = await api.derive.accounts.indexes();

  let accountsInfo = [];

  for (var key in accounts ) {
    let accountId = key;
    let accountIndex = accounts[key]
    let accountInfo = await api.derive.accounts.info(accountId);
    let identity = accountInfo.identity.display ? JSON.stringify(accountInfo.identity) : '';
    let nickname = accountInfo.nickname ? accountInfo.nickname : '';
    accountsInfo[accountId] = {
      accountId,
      identity,
      nickname,
      accountIndex
    }
    console.log(`Processing account ${accountId}`);
    // console.log(JSON.stringify(accountsInfo[accountId], null, 2));
  }

  // Log active accounts
  // console.log(JSON.stringify(accountsInfo, null, 2));

  // Main loop
  for (var key in accountsInfo ) {
    if (accountsInfo.hasOwnProperty(key)) {
      // console.log(key + " -> " + accounts[key]);
      let sql = `SELECT accountId FROM account WHERE accountId = "${key}"`;
      let [rows, fields] = await conn.execute(sql, [2, 2]);
      if (rows.length > 0) {
        console.log(`Updating account: accountId: ${key} accountIndex: ${accountsInfo[key].accountIndex} nickname: ${accountsInfo[key].nickname} identity: ${accountsInfo[key].identity}`);
        sql = `UPDATE account SET accountIndex = '${accountsInfo[key].accountIndex}', nickname = '${accountsInfo[key].nickname}', identity = '${accountsInfo[key].identity}' WHERE accountId = '${key}'`;
        await conn.execute(sql, [2, 2]);
      } else {
        console.log(`New account: accountId: ${key} accountIndex: ${accountsInfo[key].accountIndex} nickname: ${accountsInfo[key].nickname} identity: ${accountsInfo[key].identity}`);
        sql = `INSERT INTO account (accountId, accountIndex, nickname, identity) VALUES ('${key}', '${accountsInfo[key].accountIndex}', '${accountsInfo[key].nickname}', '${accountsInfo[key].identity}');`;
        await conn.execute(sql, [2, 2]);
      }
    }
  }

  conn.end();
}

main().catch(console.error).finally(() => process.exit());