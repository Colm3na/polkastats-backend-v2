// @ts-check

// Required imports
const fs = require('fs');
const { join } = require('path')
const axios = require('axios');

// Promise MySQL lib
const mysql = require('mysql2/promise');

// Import config params
const { mysqlConnParams } = require('../backend.config');

//
// Get Keybase identities
//
const srcPath = "/usr/local/polkastats-v2/identities/";
const keybaseIdentityFolders = fs.readdirSync(srcPath).filter(file => fs.statSync(join(srcPath, file)).isDirectory());
console.log(`keybase Identity Folders:`, keybaseIdentityFolders);
const keybaseIdentities = keybaseIdentityFolders.map(folder => {
  return {
    stashId: folder,
    username: fs.readFileSync(join(srcPath, folder, `keybase_username`), 'utf-8').replace(/(\r\n|\n|\r)/gm, "")
  }
});
console.log(`keybase Identities`, keybaseIdentities);

async function main () {

  //
  // Database connection
  //
  const conn = await mysql.createConnection(mysqlConnParams);

  if (keybaseIdentities.length > 0) {
    keybaseIdentities.forEach((identity) => {
      
      console.log(`Identity stashId: ${identity.stashId} username: ${identity.username}`);

      //
      // Fetch identity object from Keybase
      //
      axios.get(`https://keybase.io/_/api/1.0/user/lookup.json?username=${identity.username}`)
        .then(function (response) {
          // handle success
          console.log(`Keybase Identity:`, response);
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .finally(function () {
          // always executed
        });
      
      //
      // Insert identity
      //
      /* var sqlInsert = 'INSERT INTO keybase_identity (stashId, username, username_cased, full_name, location, bio, website, logo, updated_at) VALUES (\'' + blockHeight + '\', UNIX_TIMESTAMP());';
      let [rows, fields] = await conn.execute(sqlInsert, [2, 2]); */

    }); 
  }
}

main().catch(console.error).finally(() => process.exit());


