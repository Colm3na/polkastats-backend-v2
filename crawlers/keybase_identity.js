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
//console.log(`keybase Identity Folders:`, keybaseIdentityFolders);
const keybaseIdentities = keybaseIdentityFolders.map(folder => {
  return {
    stashId: folder,
    username: fs.readFileSync(join(srcPath, folder, `keybase_username`), 'utf-8').replace(/(\r\n|\n|\r)/gm, "")
  }
});
//console.log(`keybase Identities`, keybaseIdentities);

async function main () {

  //
  // Database connection
  //
  const conn = await mysql.createConnection(mysqlConnParams);

  if (keybaseIdentities.length > 0) {

    for(let i = 0; i < keybaseIdentities.length; i++) {
      
      let identity = keybaseIdentities[i]
      console.log(`Identity stashId: ${identity.stashId} username: ${identity.username}`);

      //
      // Fetch identity object from Keybase
      //
      await axios.get(`https://keybase.io/_/api/1.0/user/lookup.json?username=${identity.username}`)
        .then(function (response) {
          // handle success
          console.log(`Keybase Identity:`, JSON.stringify(response.data, null, 4));

          //
          // Get values
          //
          let stashId = identity.stashId;
          let username = response.data.them.basics.username;
          let username_cased = response.data.them.basics.username_cased;
          let full_name = response.data.them.profile.full_name;
          let location = response.data.them.profile.location;
          let bio = response.data.them.profile.bio;
          let website = "";
          let logo = response.data.them.pictures.primary.url;

          console.log(`stashId: ${stashId} username: ${username} username_cased: ${username_cased} full_name: ${full_name} location: ${location} bio: ${bio} website: ${website} logo: ${logo}`);

          //
          // Insert identity
          //
          /*
          var sqlInsert = 'INSERT INTO keybase_identity (stashId, username, username_cased, full_name, location, bio, website, logo, updated_at) VALUES (\'' + blockHeight + '\', UNIX_TIMESTAMP());';
          let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
          */

        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
      
    }
  }
}

main().catch(console.error).finally(() => process.exit());


