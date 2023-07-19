// This script deals with deploying the QuadraticFundingRelayStrategyFactory on a given network
import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main() {
  // Wait 10 blocks for re-org protection
  const blocksToWait = hre.network.name === "localhost" ? 0 : 10;

  await confirmContinue({
    contract: "QuadraticFundingRelayStrategyFactory",
    network: hre.network.name,
    chainId: hre.network.config.chainId,
  });

  // Deploy QuadraticFundingVotingStrategyFactory
  const contractFactory = await ethers.getContractFactory(
    "QuadraticFundingRelayStrategyFactory"
  );
  const instance = await upgrades.deployProxy(contractFactory);

  console.log(
    `Deploying Upgradable QuadraticFundingRelayStrategyFactory to ${instance.address}`
  );

  await instance.deployTransaction.wait(blocksToWait);
  console.log("✅ Deployed.");

  if (hre.network.name !== ("localhost" || "hardhat")) {
    try {
      const code = await instance.instance?.provider.getCode(instance.address);
      if (code === "0x") {
        console.log(
          `${instance.name} contract deployment has not completed. waiting to verify...`
        );
        await instance.instance?.deployed();
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
