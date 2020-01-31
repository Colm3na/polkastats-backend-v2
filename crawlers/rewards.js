//
// Return identity of all validator, intention and nominator accounts
//
// This way we serve only the identities we need to display in all 
// places except in active accounts, where we need the full list 
//

// @ts-check
// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');
const mysql = require('mysql2/promise');
const axios = require('axios');
const BigNumber = require('bignumber.js');

// Import config params
const {
  wsProviderUrl,
  mysqlConnParams
} = require('../backend.config');


// Number of reward events to fetch
const eventsNum = 10;

async function main () {

  // Start execution
  const startTime = new Date().getTime();

  //
  // Database connection
  //
  // const conn = await mysql.createConnection(mysqlConnParams);
  
  //
  // Initialise the provider to connect to the local polkadot node
  //
  // const provider = new WsProvider(wsProviderUrl);

  //
  // Initialise the provider to connect parity kusama wss
  //  
  const provider = new WsProvider('wss://kusama-rpc.polkadot.io');

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });

  // 
  // Fetch staking information of elected validators
  //

  const electedInfo = await api.derive.staking.electedInfo();
  // console.log(`electedInfo:`, JSON.stringify(electedInfo, null, 2));


  //
  // Fetch last reward events from PolkaScan
  //
  const response = await axios.get(`https://polkascan.io/kusama-cc3/api/v1/event?&filter[module_id]=staking&filter[event_id]=Reward&page[size]=${eventsNum}`);
  const rewardEvents = response.data.data;
  // console.log(JSON.stringify(rewardEvents, null, 2));
  
  // 
  // Fetch rewards event info, retrieve hash, era points and
  // elected validators for all the blocks at the end of the era 
  //
  let rewards = [];
  rewards = await Promise.all(
    rewardEvents.map(async event => {
      // console.log(reward);
      let reward_block_id = event.attributes.block_id;
      let value = event.attributes.attributes[0].value;
      let end_era_block_id = event.attributes.block_id - 1;
      let hash = await api.rpc.chain.getBlockHash(end_era_block_id);
      let eraPoints = await api.query.staking.currentEraPointsEarned.at(hash.toString());
      let endEraValidatorList = await api.query.staking.currentElected.at(hash.toString());
      const session_index = await api.query.session.currentIndex.at(hash);

      // console.log(hash.toString());
      return {
        session_index,
        reward_block_id,
        reward: value,
        end_era_block_id,
        end_era_block_hash: hash.toString(),
        points: eraPoints,
        elected_validators: endEraValidatorList
      }
    })
  );
  // console.log(`Last ${eventsNum} rewards:`, JSON.stringify(rewards, null, 2));

  // provider.disconnect();
  // process.exit();


  //
  // Fetch commission for current elected validators
  //
  let validatorRewards = await Promise.all(
    electedInfo.currentElected.map(async address => {
      // const stakeInfo = await api.derive.staking.account(address);

      
      const stakeInfo = electedInfo.info
        .find(
          val => val.stashId.toString() === address.toString()
        )
      // console.log(`stakeInfo:`, stakeInfo);
      
      const commission = stakeInfo.validatorPrefs.commission.toNumber() / 10 ** 7;

      let eraRewards = []
      rewards.forEach(reward => {
        let era_points = 0;
        let era_points_percent = 0;
        let total_era_points = reward.points.total.toNumber();
        let index = reward.elected_validators.indexOf(address);
        if (index >= 0) {
          // console.log(`foundValidatorIndex:`, index);
          era_points = reward.points.individual[index].toNumber() ;
          // console.log(`value:`, value);
          era_points_percent = (era_points * 100) / total_era_points;
          // console.log(`percent:`, percent);
          // console.log(`total:`, reward.points.total.toNumber());
        }

        let pool_reward_with_commision = ((reward.reward / 100) * era_points_percent) / 10 ** 12;

        let pool_reward = (1 - commission / 100) * pool_reward_with_commision;

        let total_stake = new BigNumber(stakeInfo.stakers.total.toString()) / 10 ** 12;

        // Daily earning logic for frontend
        const stake_amount = 1000;
        const user_stake_fraction = stake_amount / (stake_amount + total_stake);
        // Per era
        const estimated_payout = user_stake_fraction * pool_reward_with_commision;

        eraRewards.push({
          reward_session: reward.session_index,
          reward_block_id: reward.reward_block_id,
          reward_amount: reward.reward,
          era_points,
          era_points_percent,
          total_era_points,
          pool_reward_with_commision,
          pool_reward,
          total_stake,
          estimated_payout
        });

      });

      return {
        stash_id: address,
        commission,
        eraRewards,
        // stake_info: stakeInfo
      }
      
    })
  );
  console.log(`validatorRewards:`, JSON.stringify(validatorRewards, null, 2));

  // conn.end();

  //
  // Disconnect. TODO: Reuse websocket connection
  //
  provider.disconnect();

  // End execution
  const endTime = new Date().getTime();

  // 
  // Log execution time
  //
  console.log(`Execution time: ${((endTime - startTime) / 1000).toFixed(0)}s`);
}

main().catch(console.error).finally(() => process.exit());
