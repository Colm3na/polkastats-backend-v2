/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-var-requires */
// Import the API
const { ApiPromise } = require('@polkadot/api');

async function main () {
  // Create our API with a default connection to the local node
  const api = await ApiPromise.create();

  // Subscribe to system events via storage
  api.query.system.events((events) => {


    const [bestNumber, bestNumberFinalized, sessionInfo] = await Promise.all([
      api.derive.chain.bestNumber(),
      api.derive.chain.bestNumberFinalized(),
      api.derive.session.info()
    ]);

    console.log(`\nBlock height: ${bestNumber} Finalized block height: ${bestNumberFinalized} sessionInfo: ${JSON.stringify(sessionInfo, null, 2)}`);

    console.log(`\nReceived ${events.length} events:`);

    // Loop through the Vec<EventRecord>
    events.forEach((record) => {
      // Extract the phase, event and the event types
      const { event, phase } = record;
      const types = event.typeDef;

      // Show what we are busy with
      console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
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