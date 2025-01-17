import { BigNumber, ethers } from "ethers";
import { ApplicationMetadata, InputType, IPFSObject, Program } from "./types";
import { QFDistribution } from "./api";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export enum ChainId {
  MAINNET = 1,
  GOERLI_CHAIN_ID = 5,
  OPTIMISM_MAINNET_CHAIN_ID = 10,
  FANTOM_MAINNET_CHAIN_ID = 250,
  FANTOM_TESTNET_CHAIN_ID = 4002,
  POLYGON_MAINNET_CHAIN_ID = 137,
  POLYGON_MUMBAI_CHAIN_ID = 80001,
}

//TODO names and logos
// NB: number keys are coerced into strings for JS object keys
export const CHAINS: Record<number, Program["chain"]> = {
  [ChainId.MAINNET]: {
    id: ChainId.MAINNET,
    name: "Mainnet", // TODO get canonical network names
    logo: "./logos/ethereum-eth-logo.svg",
  },
  [ChainId.GOERLI_CHAIN_ID]: {
    id: ChainId.GOERLI_CHAIN_ID,
    name: "Goerli", // TODO get canonical network names
    logo: "./logos/ethereum-eth-logo.svg",
  },
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]: {
    id: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    name: "Optimism",
    logo: "./logos/optimism-logo.svg",
  },
  [ChainId.FANTOM_MAINNET_CHAIN_ID]: {
    id: ChainId.FANTOM_MAINNET_CHAIN_ID,
    name: "Fantom",
    logo: "./logos/fantom-logo.svg",
  },
  [ChainId.FANTOM_TESTNET_CHAIN_ID]: {
    id: ChainId.FANTOM_TESTNET_CHAIN_ID,
    name: "Fantom Testnet",
    logo: "./logos/fantom-logo.svg",
  },
  [ChainId.POLYGON_MAINNET_CHAIN_ID]: {
    id: ChainId.POLYGON_MAINNET_CHAIN_ID,
    name: "Polygon",
    logo: "./logos/fantom-logo.svg",
  },
  [ChainId.POLYGON_MUMBAI_CHAIN_ID]: {
    id: ChainId.POLYGON_MUMBAI_CHAIN_ID,
    name: "Polygon Mumbai",
    logo: "./logos/fantom-logo.svg",
  },
};

export type PayoutToken = {
  name: string;
  chainId: number;
  address: string;
  logo?: string;
  default?: boolean; // TODO: this is only used to provide the initial placeholder item, look for better solution
};

export type VotingOption = {
  name: string;
  strategy: string;
  default?: boolean;
  chainId: number;
  address: string;
  logo?: string;
};

export type SupportType = {
  name: string;
  regex: string;
  default: boolean;
};

export const TokenNamesAndLogos: Record<string, string> = {
  FTM: "./logos/fantom-logo.svg",
  BUSD: "./logos/busd-logo.svg",
  DAI: "./logos/dai-logo.svg",
  ETH: "./logos/ethereum-eth-logo.svg",
};

export const getPayoutTokenOptions = (chainId: ChainId): PayoutToken[] => {
  switch (chainId) {
    case ChainId.MAINNET: {
      return [
        {
          name: "DAI",
          chainId: ChainId.MAINNET,
          address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          logo: TokenNamesAndLogos["DAI"],
        },
        {
          name: "ETH",
          chainId: ChainId.MAINNET,
          address: ethers.constants.AddressZero,
          logo: TokenNamesAndLogos["ETH"],
        },
      ];
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      return [
        {
          name: "DAI",
          chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
          address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
          logo: TokenNamesAndLogos["DAI"],
        },
        {
          name: "ETH",
          chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
          address: ethers.constants.AddressZero,
          logo: TokenNamesAndLogos["ETH"],
        },
      ];
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      return [
        {
          name: "WFTM",
          chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
          address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
          logo: TokenNamesAndLogos["FTM"],
        },
        {
          name: "FTM",
          chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
          address: ethers.constants.AddressZero,
          logo: TokenNamesAndLogos["FTM"],
        },
        {
          name: "BUSD",
          chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
          address: "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50",
          logo: TokenNamesAndLogos["BUSD"],
        },
        {
          name: "DAI",
          chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
          address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
          logo: TokenNamesAndLogos["DAI"],
        },
      ];
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      return [
        {
          name: "DAI",
          chainId: ChainId.FANTOM_TESTNET_CHAIN_ID,
          address: "0xEdE59D58d9B8061Ff7D22E629AB2afa01af496f4",
          logo: TokenNamesAndLogos["DAI"],
        },
      ];
    }
    case ChainId.POLYGON_MAINNET_CHAIN_ID: {
      return [
        {
          name: "WMATIC",
          chainId: ChainId.POLYGON_MAINNET_CHAIN_ID,
          address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
          logo: TokenNamesAndLogos["DAI"],
        },
      ];
    }
    case ChainId.POLYGON_MUMBAI_CHAIN_ID: {
      return [
        {
          name: "WMATIC",
          chainId: ChainId.POLYGON_MUMBAI_CHAIN_ID,
          address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
          logo: TokenNamesAndLogos["DAI"],
        },
        {
          name: "DragonHoard",
          chainId: ChainId.POLYGON_MUMBAI_CHAIN_ID,
          address: "0xe25c884582474C4Ac87E1B5BeE4288d4F3B19C96",
          logo: TokenNamesAndLogos["BUSD"],
        },
      ];
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      return [
        {
          name: "BUSD",
          chainId: ChainId.GOERLI_CHAIN_ID,
          address: "0xa7c3bf25ffea8605b516cf878b7435fe1768c89b",
          logo: TokenNamesAndLogos["BUSD"],
        },
        {
          name: "DAI",
          chainId: ChainId.GOERLI_CHAIN_ID,
          address: "0xf2edF1c091f683E3fb452497d9a98A49cBA84666",
          logo: TokenNamesAndLogos["DAI"],
        },
        {
          name: "ETH",
          chainId: ChainId.GOERLI_CHAIN_ID,
          address: ethers.constants.AddressZero,
          logo: TokenNamesAndLogos["ETH"],
        },
      ];
    }
  }
};

export const getVotingOptions = (chainId: ChainId): VotingOption[] => {
  switch (chainId) {
    case ChainId.POLYGON_MAINNET_CHAIN_ID: {
      return [
        {
          name: "Relay voting",
          strategy: "QFRelay",
          chainId: ChainId.POLYGON_MUMBAI_CHAIN_ID,
          address: "0x87d50E83799E8f36eDCEe39cA444A7388aee13a2",
        },
      ];
    }
    case ChainId.POLYGON_MUMBAI_CHAIN_ID: {
      return [
        {
          name: "Direct voting",
          strategy: "QFVoting",
          chainId: ChainId.POLYGON_MUMBAI_CHAIN_ID,
          address: "0xA86837773d8167C20f648Fcc11dB7eA4B95B4b7A",
        },
        {
          name: "Relay voting",
          strategy: "QFRelay",
          chainId: ChainId.POLYGON_MUMBAI_CHAIN_ID,
          address: "0x0637876724150495d2B4F73A18EA87bCb78E63DB",
        },
      ];
    }
    case ChainId.MAINNET:
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID:
    case ChainId.FANTOM_MAINNET_CHAIN_ID:
    case ChainId.FANTOM_TESTNET_CHAIN_ID:
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      return [
        {
          name: "Direct voting",
          strategy: "QFVoting",
          chainId: ChainId.POLYGON_MUMBAI_CHAIN_ID,
          address: "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
          logo: TokenNamesAndLogos["DAI"],
        },
        {
          name: "Relay voting",
          strategy: "QFRelay",
          chainId: ChainId.POLYGON_MUMBAI_CHAIN_ID,
          address: "0x0637876724150495d2B4F73A18EA87bCb78E63DB",
        },
      ];
    }
  }
};

/**
 * Fetch subgraph network for provided web3 network
 *
 * @param chainId - The chain ID of the blockchain2
 * @returns the subgraph endpoint
 */
const getGraphQLEndpoint = async (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.MAINNET:
      return `${process.env.REACT_APP_SUBGRAPH_MAINNET_API}`;
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API}`;
    case ChainId.FANTOM_MAINNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_FANTOM_MAINNET_API}`;
    case ChainId.FANTOM_TESTNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_FANTOM_TESTNET_API}`;
    case ChainId.POLYGON_MAINNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_POLYGON_MAINNET_API}`;
    case ChainId.POLYGON_MUMBAI_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_POLYGON_MUMBAI_API}`;
    case ChainId.GOERLI_CHAIN_ID:
    default:
      return `${process.env.REACT_APP_SUBGRAPH_GOERLI_API}`;
  }
};

/**
 * Fetch data from a GraphQL endpoint
 *
 * @param query - The query to be executed
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @param variables - The variables to be used in the query
 * @param fromProjectRegistry - Override to fetch from grant hub project registry subgraph
 * @returns The result of the query
 */
export const graphql_fetch = async (
  query: string,
  chainId: ChainId,
  variables: object = {},
  fromProjectRegistry = false
) => {
  let endpoint = await getGraphQLEndpoint(chainId);

  if (fromProjectRegistry) {
    endpoint = endpoint.replace("grants-round", "grants-hub");
  }

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  }).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }

    return Promise.reject(resp);
  });
};

/**
 * Fetch data from IPFS
 * TODO: include support for fetching abitrary data e.g images
 *
 * @param cid - the unique content identifier that points to the data
 */
export const fetchFromIPFS = (cid: string) => {
  let path = `https://${cid}.ipfs.dweb.link/`;
  if (process.env.REACT_APP_PINATA_GATEWAY) {
    path = `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`;
  }

  return fetch(path).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }

    return Promise.reject(resp);
  });
};

/**
 * Pin data to IPFS
 * The data could either be a file or a JSON object
 *
 * @param obj - the data to be pinned on IPFS
 * @returns the unique content identifier that points to the data
 */
export const pinToIPFS = (obj: IPFSObject) => {
  const params = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
    },
    body: {
      pinataMetadata: obj.metadata,
      pinataOptions: {
        cidVersion: 1,
      },
    },
  };

  /* typeof Blob === 'object', so we need to check against instanceof */
  if (obj.content instanceof Blob) {
    // content is a blob
    const fd = new FormData();
    fd.append("file", obj.content as Blob);
    fd.append("pinataOptions", JSON.stringify(params.body.pinataOptions));
    fd.append("pinataMetadata", JSON.stringify(params.body.pinataMetadata));

    return fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      ...params,
      body: fd,
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  } else {
    // content is a JSON object
    return fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      ...params,
      headers: {
        ...params.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...params.body, pinataContent: obj.content }),
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  }
};

export const abbreviateAddress = (address: string) =>
  `${address.slice(0, 8)}...${address.slice(-4)}`;

export interface SchemaQuestion {
  id: number;
  question: string;
  type: InputType;
  required: boolean;
  info: string;
  choices: [];
  encrypted: boolean;
}

/**
 * This function generates the round application schema to be stored in a decentralized storage
 *
 * @param questions - The metadata of a round application
 * @returns The application schema
 */
export const generateApplicationSchema = (
  questions: ApplicationMetadata["questions"]
): Array<SchemaQuestion> => {
  if (!questions) return [];

  return questions.map((question, index) => {
    return {
      id: index,
      question: question.title,
      type: question.inputType,
      required: question.required,
      info: "",
      choices: [],
      encrypted: question.encrypted,
    };
  });
};

/* We can safely suppress the eslint warning here, since JSON.stringify accepts any*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveObjectAsJson(filename: string, dataObjToWrite: any) {
  const blob = new Blob([JSON.stringify(dataObjToWrite)], {
    type: "text/json",
  });
  const link = document.createElement("a");

  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

  const evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  link.dispatchEvent(evt);
  link.remove();
}

// Checks if tests are being run jest
export const isJestRunning = () => process.env.JEST_WORKER_ID !== undefined;

export const prefixZero = (i: number): string =>
  i < 10 ? "0" + i : i.toString();

export const getUTCDate = (date: Date): string => {
  const utcDate = [
    prefixZero(date.getUTCDate()),
    prefixZero(date.getUTCMonth() + 1),
    prefixZero(date.getUTCFullYear()),
  ];

  return utcDate.join("/");
};

export const getUTCTime = (date: Date): string => {
  const utcTime = [
    prefixZero(date.getUTCHours()),
    prefixZero(date.getUTCMinutes()),
  ];

  return utcTime.join(":") + " UTC";
};

export const generateStandardMerkleTree = (distribution: QFDistribution[]) => {
  console.log("Generating merkle tree for distribution: ", distribution);

  const distributionResults: Record<
    string,
    {
      projectPayoutAddress: string;
      matchAmount: BigNumber;
      projectId: string;
    }
  > = {};
  for (const item of distribution) {
    if (distributionResults[item.projectPayoutAddress]) {
      distributionResults[item.projectPayoutAddress].matchAmount =
        distributionResults[item.projectPayoutAddress].matchAmount.add(
          BigNumber.from(item.matchAmount)
        );
    } else {
      distributionResults[item.projectPayoutAddress] = {
        projectPayoutAddress: item.projectPayoutAddress,
        matchAmount: BigNumber.from(item.matchAmount),
        projectId: item.projectId.split("-")[0],
      };
    }
  }

  console.log("distribution results", distributionResults);

  const values = Object.values(distributionResults).map((item) => [
    item.projectPayoutAddress,
    item.matchAmount,
    ethers.utils.formatBytes32String(item.projectId),
  ]);

  console.log("merkle tree values: ", values);

  // const totalValue = values.reduce((acc, curr) => {
  //   return acc.add(curr[1]);
  // }, BigNumber.from(0));
  // console.log(totalValue.toString());

  return {
    values,
    tree: StandardMerkleTree.of(values, ["address", "uint256", "bytes32"]),
  };
};
