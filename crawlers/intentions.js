// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Local Polkadot node
var wsProviderUrl = 'ws://127.0.0.1:9944';

async function main () {
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  const provider = new WsProvider(wsProviderUrl);

  // Create the API and wait until ready
  const api = await ApiPromise.create(provider);
  
  //
  // Fetch intention validators
  //
  const stakingValidators = await Promise.all([
    api.query.staking.validators()
  ]);
  const validators = stakingValidators[0][0]

  //
  // Map validator authorityId to staking info object
  //
  const validatorStaking = await Promise.all(
    validators.map(authorityId => api.derive.staking.info(authorityId))
  );

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();

  //
  // Outputs JSON
  //
  console.log(JSON.stringify(validatorStaking));
}

main().catch(console.error).finally(() => process.exit());