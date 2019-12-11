/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-var-requires */
// Import the API
const { ApiPromise } = require('@polkadot/api');

async function main () {
  // Create our API with a default connection to the local node
  const api = await ApiPromise.create();

  // Subscribe to system events via storage
  api.query.system.events(events => {
    
    // Block height is not 100% accurate, get duplicated in some cases
    // const blockHeight = await api.derive.chain.bestNumber();

    // console.log(`\nReceived ${events.length} events at block #${blockHeight}:\n`);
    console.log(`\nReceived ${events.length} events:\n`);

    // Loop through the Vec<EventRecord>
    events.forEach((record, index) => {
      // Extract the phase, event and the event types
      const { event, phase } = record;
      const types = event.typeDef;

      // Show what we are busy with
      console.log(`\t${index+1}. ${event.section}:${event.method}:: (phase=${phase.toString()})`);
      console.log(`\t\t${event.meta.documentation.toString()}`);

      // Loop through each of the parameters, displaying the type and data
      event.data.forEach((data, index) => {
        console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
      });
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});