// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Promise MySQL lib
const mysql = require('mysql2/promise');

// Import config params
const {
  mysqlConnParams
} = require('../backend.config');

async function main () {

  // Database connection
  const conn = await mysql.createConnection(mysqlConnParams);
  
  // Create API with a default connection to the local node
  const api = await ApiPromise.create();
  
  // Fetch active accounts
  
  const accounts = await api.derive.accounts.indexes();

  console.log(JSON.stringify(accounts, null, 2));

  const accountsArray = JSON.parse(JSON.stringify(accounts))

  accountsArray.forEach( async account => {
    console.log(JSON.stringify(account));
    var sqlInsert = 'INSERT INTO account_index (accountId, accountIndex) VALUES (\'' + account.accountId + '\', \'' + account.accountIndex + '\');';
    let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);     
  });

  conn.end();

}

main().catch(console.error).finally(() => process.exit());