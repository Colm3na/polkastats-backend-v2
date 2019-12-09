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
  const api = await ApiPromise.create(provider);

  //
  // Fetch chain, node name and node version
  //
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  if (chain && nodeName && nodeVersion) {
    console.log(`chain: ${chain} nodeName: ${nodeName} nodeVersion: ${nodeVersion}`);
    var sqlInsert = 'INSERT INTO system (chain, client_name, client_version, timestamp) VALUES (\'' + chain + '\', \'' + nodeName + '\', \'' + nodeVersion + '\', UNIX_TIMESTAMP());';
    let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
  }

  conn.end();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();
}

main().catch(console.error).finally(() => process.exit());