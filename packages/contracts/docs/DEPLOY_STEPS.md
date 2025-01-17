### Networks

The project has been configured to support the following networks.
All the deploy scripts will expect network param to know which network the contract deployment / interaction should take place

| network            |
| ------------------ |
| `localhost`           |
| `polygon-mumbai` |
| 'polygon'   |


### Program Setup

The section here shows how to set up the program for the first time on a given network. Ideally these steps would be done once per chain. In this example , we would be deploying on goerli

0. Create an `.env` file

```sh
cp ../.env.example ../.env
```

1. Create an `.env` file and fill out

   - `INFURA_ID` : Infura ID for deploying contract
   - `DEPLOYER_PRIVATE_KEY` : address which deploys the contract
   - `ETHERSCAN_API_KEY` : API key for etherscan verification


### UPDATED DEPLOY SCRIPTS can be run on polygon-mumbai, localhost, and polygon

if you would like to use the old deployment method skip to "OLD DEPLOYMENT METHOD"  if you want to save some time and effort just do the next two steps.

(if you want to create a local environment open a new terminal and run `yarn run-node` then in a new window run `yarn create-local-environment`)

  2. deploy all contracts

 ```shell
  yarn deploy-all polygon-mumbai
  ```
  follow instructions

  3. create a new round
  
```shell
  yarn create-new-round polygon-mumbai
  ```

     follow instructions and then you're done you can stop here.



### OLD DEPLOYMENT METHOD

2. Deploy the `ProgramFactory` contract

```shell
yarn run deploy-program-factory goerli
```

3. Deploy the `ProgramImplementation` contract

```shell
yarn run deploy-program-implementation goerli
```

4. Update `program.config.ts` with deployed contracts based on your network

```javascript
export const params: DeployParams = {
  goerli: {
    programImplementationContract: 'DEPLOYED_PROGRAM_IMPLEMENTATION_CONTRACT',
    programFactoryContract: 'DEPLOYED_PROGRAM_FACTORY_CONTRACT',
    ...
  },
};
```

5. Update `ProgramFactory` to reference the `ProgramImplementation` contract.

```shell
yarn run link-program-implementation goerli
```

### VotingStrategy Setup

The section here shows how to set up voting strategy for the first time on a given network. Ideally these steps would be done once per chain. In this example ,we would be deploying the QuadraticFundingVotingStrategyImplementation contract on goerli.

There are two voting strategies implemented. One where the user submits the vote directly (QuadraticFundingVotingStrategy) and one where an intermediary contract can be used to submit a vote (QuadraticFundingRelayStrategy)

The following steps are for QuadraticFundingVotingStrategy. A summary for QuadraticFundingRelayStrategy is posted after these steps.

1. Create an `.env` file and fill out

   - `INFURA_ID` : Infura ID for deploying contract
   - `DEPLOYER_PRIVATE_KEY` : address which deploys the contract
   - `ETHERSCAN_API_KEY` : API key for etherscan verification

2. Deploy the `QuadraticFundingVotingStrategyFactory` contract

```shell
yarn run deploy-qf-factory goerli
```

3. Deploy the `QuadraticFundingVotingStrategyImplementation` contract

```shell
yarn run deploy-qf-implementation goerli
```

4. Update `votingStrategy.config.ts` with deployed contracts based on your network

```javascript
export const QFVotingParams: DeployParams = {
  "goerli": {
    factory: 'DEPLOYED_QF_FACTORY_CONTRACT',
    implementation: 'DEPLOYED_QF_IMPLEMENTATION_CONTRACT',
    ...
  },
  ...
};
```

5. Update `QuadraticFundingVotingStrategyFactory` to reference the `QuadraticFundingVotingStrategyImplementation` contract

```shell
yarn run link-qf-implementation goerli
```

#### For QuadraticFundingRelayStrategy

After step 1..

2. `yarn run deploy-qf-relay-factory goerli`
3. `yarn run deploy-qf-relay-implementation goerli`

4. Update `votingStrategy.config.ts` with deployed contracts based on your network

```javascript
export const QFRelayParams: DeployParams = {
  "goerli": {
    factory: 'DEPLOYED_QF__RELAY_FACTORY_CONTRACT',
    implementation: 'DEPLOYED_QF_RELAY_IMPLEMENTATION_CONTRACT',
    ...
  },
  ...
};
```

5. Update `QuadraticFundingRelayStrategyFactory` to reference the `QuadraticFundingRelayStrategyImplementation` contract

```shell
yarn run link-qf-relay-implementation goerli
```

### PayoutStrategy Setup

The section here shows how to deploy the payout strategy contract. Ideally these would be done before creating a round. In this example ,we would be deploying the MerklePayoutStrategy contract on goerli. This would have to be done before creating a round
so that round is aware and store a reference to the voting contract during it's creation.

1. Create an `.env` file and fill out

   - `INFURA_ID` : Infura ID for deploying contract
   - `DEPLOYER_PRIVATE_KEY` : address which deploys the contract
   - `ETHERSCAN_API_KEY` : API key for etherscan verification

2. Deploy the `MerklePayoutStrategyFactory` contract

```shell
yarn run deploy-merkle-contract goerli
```

3. Update `payoutStrategy.config.ts` with deployed contract based on your network

```javascript
export const PayoutParams: DeployParams = {
  "goerli": {
    merklePayoutContract: 'DEPLOYED_MERKLE_CONTRACT',
    ...
  },
  ...
};
```

### Round Setup

The section here shows how to set up the round manager for the first time on a given network. Ideally these steps would be done once per chain. In this example , we would be deploying on goerli

1. Create an `.env` file and fill out

   - `INFURA_ID` : Infura ID for deploying contract
   - `DEPLOYER_PRIVATE_KEY` : address which deploys the contract
   - `ETHERSCAN_API_KEY` : API key for etherscan verification on mainnet / testnet
   - `OPTIMISTIC_ETHERSCAN_API_KEY` : API key for etherscan verification on optimism mainnet / testnet

2. Deploy the `RoundFactory` contract

```shell
yarn run deploy-round-factory goerli
```

3. Deploy the `RoundImplementation` contract

```shell
yarn run deploy-round-implementation goerli
```

4. Update `round.config.ts` with deployed contracts based on your network

```javascript
export const params: DeployParams = {
  goerli: {
    roundImplementationContract: 'DEPLOYED_ROUND_IMPLEMENTATION_CONTRACT',
    roundFactoryContract: 'DEPLOYED_ROUND_FACTORY_CONTRACT',
    ...
  },
  ...
};
```

5. Update `RoundFactory` to reference the `RoundImplementation` contract

```shell
yarn run link-round-implementation goerli
```

### Payout Setup

<!-- TODO -->

### Contract Verification on etherscan

```
yarn hardhat clean
yarn hardhat verify --network goerli <CONTRACT_ADDRESS>
```

##### Helper Deploy Script

```shell

# Program
yarn run deploy-program-factory goerli
yarn run deploy-program-implementation goerli
yarn run link-program-implementation goerli

# QF
yarn run deploy-qf-factory goerli
yarn run deploy-qf-implementation goerli
yarn run link-qf-implementation goerli

# QF Relay
yarn run deploy-qf-relay-factory goerli
yarn run deploy-qf-relay-implementation goerli
yarn run link-qf-relay-implementation goerli

# Payout
yarn run deploy-merkle-payout-factory goerli
yarn run deploy-merkle-payout-implementation goerli
yarn run link-merkle-payout goerli

# Round
yarn run deploy-round-factory goerli
yarn run deploy-round-implementation goerli
yarn run link-round-implementation goerli
yarn run create-round goerli

# These scripts would be used tp create a test round
yarn run create-program goerli
yarn run create-qf-contract goerli
yarn run deploy-merkle-contract goerli
yarn run create-round goerli
```
