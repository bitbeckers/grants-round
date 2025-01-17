import { Request, Response } from "express";
import { ChainId, QFContributionSummary, RoundMetadata } from "../types";
import { handleResponse } from "../utils";
import {
  fetchQFContributionsForRound,
  summarizeQFContributions
} from "../votingStrategies/linearQuadraticFunding";
import { cache } from "../cacheConfig";
import { updateRoundSummary } from "../lib/updateRoundSummary";
import { hotfixForRounds } from "../hotfixes";

/**
 * updateRoundSummaryHandler is a function that handles HTTP requests for summary information for a given round.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The HTTP response that will be sent.
 * @returns {void}
 */
export const updateRoundSummaryHandler = async (
  req: Request,
  res: Response
) => {
  let { chainId, roundId } = req.params;

  if (!chainId || !roundId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId or roundId"
    );
  }

  try {
    const result = await updateRoundSummary(chainId as ChainId, roundId);

    cache.set(`cache_${req.originalUrl}`, result);

    return handleResponse(res, 200, `${req.originalUrl}`, result);
  } catch (error) {
    console.error("updateRoundSummaryHandler", error);
    return handleResponse(res, 500, "error: something went wrong");
  }
};

/**
 * getRoundSummary is a function that fetches metadata and summary information for a given round from a GraphQL API.
 *
 * @param {ChainId} chainId - The ID of the chain to fetch data from.
 * @param {string} roundId - The ID of the round to fetch data for.
 * @returns {Promise<QFContributionSummary>} A promise that resolves to an object containing the summary data for the round.
 */
export const getRoundSummary = async (
  chainId: ChainId,
  roundId: string,
  roundMetadata: RoundMetadata
): Promise<QFContributionSummary> => {
  let results: QFContributionSummary;

  let { id: votingStrategyId, strategyName } = roundMetadata.votingStrategy;

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch contributions
      let contributions = await fetchQFContributionsForRound(chainId, roundId);

      contributions = await hotfixForRounds(chainId, roundId, contributions);

      // fetch round stats
      results = await summarizeQFContributions(chainId, contributions);
      break;
    default:
      throw "error: unsupported voting strategy";
  }

  return results;
};
