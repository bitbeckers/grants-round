import { ChainId, QFContribution } from "../types";
import { addMissingUNICEFContributions } from "./unicefMissingContributions";
import { fetchQFContributionsForRound } from "../votingStrategies/linearQuadraticFunding";
import { backupRounds, ignoredAddresses } from "../constants";

export const hotfixForRounds = async (
  chainId: ChainId,
  roundId: string,
  contributions: QFContribution[],
  projectIds?: string[]
): Promise<QFContribution[]> => {
  // Unicef contributions sent to optimism (wrong network)
  if (roundId == "0xdf75054cd67217aee44b4f9e4ebc651c00330938") {
    contributions = await addMissingUNICEFContributions(
      contributions,
      projectIds
    );
  }

  // Use contributions for the backup round as well, useful when extending a round into a different one
  if (backupRounds[roundId]) {
    const backupRoundId = backupRounds[roundId];
    const backupContributions = await fetchQFContributionsForRound(
      chainId,
      backupRoundId
    );

    contributions = contributions.concat(backupContributions);
  }

  const filteredContributionAddresses = ignoredAddresses[roundId] || [];

  if (filteredContributionAddresses.length) {
    const filteredContributions: QFContribution[] = contributions.filter(
      contribution =>
        filteredContributionAddresses.includes(
          contribution.projectPayoutAddress
        )
    );

    if (filteredContributions.length) {
      console.log(
        "Filtered contributions for round",
        roundId,
        filteredContributions
      );
    }

    contributions = contributions.filter(
      contribution =>
        !filteredContributionAddresses.includes(
          contribution.projectPayoutAddress
        )
    );
  }

  return contributions;
};
