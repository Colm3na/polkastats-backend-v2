// @ts-check

// Required imports
const fs = require('fs');
const { join } = require('path')

// Promise MySQL lib
const mysql = require('mysql2/promise');

// Import config params
const { mysqlConnParams } = require('../backend.config');

//
// Get Keybase identities from polkastats-v2
//
const srcPath = "/usr/local/polkastats-v2/identities/";
const keybaseIdentityFolders = fs.readdirSync(srcPath).filter(file => fs.statSync(join(srcPath, file)).isDirectory());
console.log(`keybase Identity Folders:`, keybaseIdentityFolders);
const keybaseIdentities = keybaseIdentityFolders.map(folder => fs.readFileSync(join(srcPath, folder, `keybase_username`), 'utf-8'));
console.log(`keybase Identities`, keybaseIdentities);




/* async function main () {

  //
  // Database connection
  //
  const conn = await mysql.createConnection(mysqlConnParams);


  if (blockHeight && session) {
    console.log(`block_height: ${blockHeight} session: ${JSON.stringify(session)}`);
    var sqlInsert = 'INSERT INTO chain (block_height, session_json, timestamp) VALUES (\'' + blockHeight + '\', \'' + JSON.stringify(session) + '\', UNIX_TIMESTAMP());';
    let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
  }

  // https://keybase.io/_/api/1.0/user/lookup.json?username=dragonstake


}

main().catch(console.error).finally(() => process.exit());
 */

