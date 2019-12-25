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

  // Database connection
  const conn = await mysql.createConnection(mysqlConnParams);

  // Get current block number from DB
  const getLastBlockFromDB = async () => {
    const sqlSelect = 'SELECT block_number FROM block ORDER BY block_number DESC LIMIT 1;';
    const [rows] = await conn.execute(sqlSelect, [2, 2]);
    const currentBlockNumber = rows[0].block_number;
    
    return currentBlockNumber;
  }

  const getLastBlockCountdown = async (timer) => {
    console.log('Timer is', timer);
    if (timer >= 10) {
      const currentBlockNumber = await getLastBlockFromDB();

      console.log(`Last current block number: #${currentBlockNumber}`);
      timer = 0;
      return { currentBlockNumber, timer }
    } else {
      return {timer};
    }
  }

  let timer = 0;

  // while(oldBlockNumber < currentBlockNumber) {
  setInterval(async () => {
    oldBlockNumber++
    console.log(`Follow up block number: #${oldBlockNumber}`);

    timer++

    const countdownRes = await getLastBlockCountdown(timer);
    timer = countdownRes.timer;

    const oldBlockHash = await api.rpc.chain.getBlockHash(oldBlockNumber);
    // It doesn't return the real block hash!
    // console.log('\n Old block hash', oldBlockHash);

    const oldBlockExtendedHeader = await api.derive.chain.getHeader(oldBlockHash);
    // This shows an error (is not receiving a correct block hash, so it makes sense)
    // console.log('\n Old block header', oldBlockExtendedHeader);

    // We connect/disconnect to MySQL in each loop to avoid problems if MySQL server is restarted while the crawler is running
    conn.end();
  }, 1000);
}
// }

main().catch((error) => {
    console.error(error);
    process.exit(-1);
});
