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

    // Get events from parent block
    const events = await api.query.system.events.at(header.parentHash);

    // Loop through the Vec<EventRecord>
    events.forEach( async (record, index) => {
      // Extract the phase and event
      const { event, phase } = record;

      // Get block number
      const blockNumber = header.number.toNumber() - 1;

      // Database connection
      const conn = await mysql.createConnection(mysqlConnParams);
      
      // Check if events was already in database for that block
      const sqlSelect = 'SELECT * FROM event WHERE blockNumber = ' + blockNumber + ';';
      const [rows, fields] = await conn.execute(sqlSelect, [2, 2]);
      
      // Skip insert if events was already in database for that block
      if (rows.length === 0) {
        console.log(`blockNumber: ${blockNumber}, index: ${index}, section: ${event.section}, method: ${event.method}, phase: ${phase.toString()}, documentation: ${event.meta.documentation.toString()}, data: ${JSON.stringify(event.data)}`);
        const sqlInsert = 'INSERT INTO event (blockNumber, eventIndex, section, method, phase, data) VALUES (\'' + blockNumber + '\', \'' + index + '\', \'' + event.section + '\', \'' + event.method + '\', \'' + phase.toString() + '\', \'' + JSON.stringify(event.data) + '\');';
        const [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
      }
      // We connect/disconnect to MySQL in each loop to avoid problems if MySQL server is restarted while the crawler is running
      conn.end();
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});

