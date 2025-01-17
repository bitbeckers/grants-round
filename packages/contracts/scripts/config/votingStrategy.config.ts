// Update this file any time a new QF voting contract has been deployed
type QFVotingParameters = {
  factory: string;
  implementation: string;
  contract: string;
};

type DeployParams = Record<string, QFVotingParameters>;

export const QFVotingParams: DeployParams = {
  mainnet: {
    factory: "0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38",
    implementation: "0x5030e1a81330d5098473E8d309E116C2792202eB",
    contract: "0x818A3C8F82667bd222faF84a954F35d2b0Eb6a78",
  },
  goerli: {
    factory: "0xF741F7B6a4cb3B4869B2e2C01aB70A12575B53Ab",
    implementation: "0xcaBE5370293addA85e961bc46fE5ec6D3c6aab28",
    contract: "0xBF539cD4024Ab2140aA864ba2C6A430201b19318",
  },
  "optimism-mainnet": {
    factory: "0xE1F4A28299966686c689223Ee7803258Dbde0942",
    implementation: "0xB70aCf9654fe304CfE24ee2fA9302a987d22c31e",
    contract: "0x2D3Abb193d5118A2F96004A9316830d9E96f44Aa",
  },
  "fantom-mainnet": {
    factory: "0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38",
    implementation: "0xa71864fAd36439C50924359ECfF23Bb185FFDf21",
    contract: "0x818A3C8F82667bd222faF84a954F35d2b0Eb6a78",
  },
  "fantom-testnet": {
    factory: "0x6038fd0D126CA1D0b2eA8897a06575100f7b16C2",
    implementation: "0x1eBBf0FC753e03f13Db456A3686523Fc589E4f67",
    contract: "0x02B52C3a398567AdFffb3396d6eE3d3c2bff37fE",
  },
  "polygon-mumbai": {
    factory: "0xA9e84078d3F40d284D494D02f6C8b1d175b28bB2",
    implementation: "0x810A1D1e27d4B5eddd9E2c5Ca33339f0A41bdd9d",
    contract: "0xb699801f40079b793d806a5a96b37bceaee4c838",
  },
};

export const QFRelayParams: DeployParams = {
  mainnet: {
    factory: "",
    implementation: "",
    contract: "",
  },
  goerli: {
    factory: "",
    implementation: "",
    contract: "",
  },
  "polygon-mumbai": {
    factory: "0xBcC6f8AeCCd46b941A3A0BFd5eC3E0155Bcb78ba",
    implementation: "0xfCAD218132214E2e329bA35b7771a80b2f777EF1",
    contract: "0x2c18a01d8E8B282905F9D14Dc3781cCEd5fF9aF4",
  },
};
