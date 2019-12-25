const { ApiPromise, WsProvider } = require('@polkadot/api')

// Promise MySQL lib
const mysql = require('mysql2/promise');

// Import config params
const {
  wsProviderUrl,
  mysqlConnParams
} = require('./backend.config');

let oldBlockNumber = 0

async function main () {

  // Initialise the provider to connect to the local polkadot node
  const provider = new WsProvider(wsProviderUrl);

  // Create API with a default connection to the local node
  const api = await ApiPromise.create({ provider });

  // Subscribe to new blocks
  const unsubscribe = await api.rpc.chain.subscribeNewHeads( async (header) => {
    // Database connection
    const conn = await mysql.createConnection(mysqlConnParams);

    // Get block number
    const currentBlockNumber = header.number.toNumber();

    // while(oldBlockNumber < currentBlockNumber) {
      console.log(`Last current block number: #${currentBlockNumber}`);
    
      setInterval( async () => {

        oldBlockNumber++
        console.log(`Follow up block number: #${oldBlockNumber}`);

        const oldBlockHash = await api.rpc.chain.getBlockHash(oldBlockNumber);
        // It doesn't return the real block hash!
        // console.log('\n Old block hash', oldBlockHash);

        const oldBlockExtendedHeader = await api.derive.chain.getHeader(oldBlockHash);
        // This shows an error (is not receiving a correct block hash, so it makes sense)
        // console.log('\n Old block header', oldBlockExtendedHeader);

    }, 1000)

    const [blockHeight, blockHeightFinalized, totalIssuance, session] = await Promise.all([
      api.derive.session.info()
    ]);
    // This also shows an error most of the time, I really don't know why
    console.log('\n Old block session info', blockHeight, session);

    // We connect/disconnect to MySQL in each loop to avoid problems if MySQL server is restarted while the crawler is running
    conn.end();
  })
}

main().catch((error) => {
    console.error(error);
    process.exit(-1);
});
