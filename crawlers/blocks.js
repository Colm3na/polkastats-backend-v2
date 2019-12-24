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
  
  // Subscribe to new blocks
  const unsubscribe = await api.rpc.chain.subscribeNewHeads( async (header) => {

    // Get block number
    const blockNumber = header.number.toNumber();

    // Get block author
    const blockAuthor = await api.query.authorship.author();

    const [blockHeight, blockHeightFinalized, totalIssuance, session] = await Promise.all([
      api.derive.chain.bestNumber(),
      api.derive.chain.bestNumberFinalized(), 
      api.query.balances.totalIssuance(),
      api.derive.session.info()
    ]);
    
    console.error(`header: ${JSON.stringify(header)}`);

    console.error(`block: #${blockNumber} author: ${blockAuthor}`);
    console.log(`block_height: ${blockHeight} block_height_finalized: ${blockHeightFinalized} session: ${JSON.stringify(session)} total_issuance: ${totalIssuance}`);

    // parentHash0xcb52b0d62ecd230667082a31aade303e22ffd32692ecac6c6549e682e804446b
    // extrinsicsRoot0x7860c4743564a365dff83359fbf07cc5205cc9c7b150f2e2005a427fa9ea2308
    // stateRoot0x032a8d7c6ebabc7a84381c2790353b1e540322a51a5e6c0d0ead7b51b487d82e

  });
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});

