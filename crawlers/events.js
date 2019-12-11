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
    
    // console.log(`\nReceived ${events.length} events at block #${header.number-1}:\n`);

    // Loop through the Vec<EventRecord>
    events.forEach( async (record, index) => {
      // Extract the phase, event and the event types
      const { event, phase } = record;
      const types = event.typeDef;

      // Show what we are busy with
      // console.log(`\t${index+1}. ${event.section}:${event.method}:: (phase=${phase.toString()})`);
      // console.log(`\t\t${event.meta.documentation.toString()}`);

      // Loop through each of the parameters, displaying the type and data
      event.data.forEach((data, index) => {
        // console.log(`\t\t\t${types[index].type}: ${data.toString()}`);

        let blockNumber = header.number.toNumber() - 1;
        var sqlInsert = 'INSERT INTO event (blockNumber, section, method, phase, documentation, type, data) VALUES (\'' + blockNumber + '\', \'' + event.section + '\', \'' + event.method + '\', \'' + phase.toString() + '\', \'' + event.meta.documentation.toString() + '\', \'' + types[index].type + '\', \'' + data.toString() + '\');';
        console.log(sqlInsert);
        // let [rows, fields] = await conn.execute(sqlInsert, [2, 2]);
      });
    });

  });

}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});

