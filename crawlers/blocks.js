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

    // Get block parent hash
    const parentHash = header.parentHash;
    
    // Get block extrinsics root
    const extrinsicsRoot = header.extrinsicsRoot;

    // Get block state root
    const stateRoot = header.stateRoot;

    // Get block author, best finalized block, total issuance and session info
    const [blockAuthor, blockNumberFinalized, totalIssuance, session] = await Promise.all([
      api.query.authorship.author(),
      api.derive.chain.bestNumberFinalized(), 
      api.query.balances.totalIssuance(),
      api.derive.session.info()
    ]);

    console.error(`Best block: #${blockNumber} finalized: #${blockNumberFinalized}`);
    console.error(`\tauthor: ${blockAuthor}`);
    console.error(`\tparentHash: ${parentHash}`);
    console.error(`\textrinsicsRoot: ${extrinsicsRoot}`);
    console.error(`\tstateRoot: ${stateRoot}`);
    console.error(`\ttotalIssuance: ${totalIssuance}`);
    console.error(`\tsession: ${JSON.stringify(session)}`);

  });
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});

