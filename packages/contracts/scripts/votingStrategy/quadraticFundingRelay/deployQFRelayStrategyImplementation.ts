// This script deals with deploying QuadraticFundingRelayStrategyImplementation on a given network
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main() {
  // Wait 10 blocks for re-org protection
  const blocksToWait = hre.network.name === "localhost" ? 0 : 10;

  await confirmContinue({
    contract: "QuadraticFundingRelayStrategyImplementation",
    network: hre.network.name,
    chainId: hre.network.config.chainId,
  });

  // Deploy QFImplementation
  const contractFactory = await ethers.getContractFactory(
    "QuadraticFundingRelayStrategyImplementation"
  );
  const instance = await contractFactory.deploy();
  await instance.deployed();

  console.log(
    `Deploying QuadraticFundingRelayStrategyImplementation to ${instance.address}`
  );

  await instance.deployTransaction.wait(blocksToWait);
  console.log("✅ Deployed.");

  if (hre.network.name !== ("localhost" || "hardhat")) {
    try {
      const code = await instance?.provider.getCode(instance.address);
      if (code === "0x") {
        console.log(
          `contract deployment has not completed. waiting to verify...`
        );
        await instance?.deployed();
      }

      await hre.run("verify:verify", {
        address: instance.address,
      });
    } catch ({ message }) {
      if ((message as string).includes("Reason: Already Verified")) {
        console.log("Reason: Already Verified");
      }
      console.error(message);
    }
  }

  return instance.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
