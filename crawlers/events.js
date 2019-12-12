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

  //
  // Database connection
  //
  const conn = await mysql.createConnection(mysqlConnParams);
  
  // Create our API with a default connection to the local node
  const api = await ApiPromise.create();

  const unsubscribe = await api.rpc.chain.subscribeNewHeads( async (header) => {

    const events = await api.query.system.events.at(header.parentHash);

    // Loop through the Vec<EventRecord>
    events.forEach( async (record, index) => {
      // Extract the phase, event and the event types
      const { event, phase } = record;
      const types = event.typeDef;

      console.log(`types`, JSON.stringify(record, null, 2));

      // Skip insert if events was already in database for that block
      // let blockNumber = header.number.toNumber() - 1;
      // var sqlSelect = 'SELECT * FROM event WHERE blockNumber = ' + blockNumber + ';';
      // let [rows, fields] = await conn.execute(sqlSelect, [2, 2]);
        
      // if (rows.length === 0) {
      //   console.log(`blockNumber: ${blockNumber}, section: ${event.section}, method: ${event.method}, phase: ${phase.toString()}, documentation: ${event.meta.documentation.toString()}, data: ${JSON.stringify(event.data)}`);
      //   var sqlInsert = 'INSERT INTO event (blockNumber, section, method, phase, data) VALUES (\'' + blockNumber + '\', \'' + event.section + '\', \'' + event.method + '\', \'' + phase.toString() + '\', \'' + JSON.stringify(event.data) + '\');';
      //   // console.log(sqlInsert);
      //   let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
      // }
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});

