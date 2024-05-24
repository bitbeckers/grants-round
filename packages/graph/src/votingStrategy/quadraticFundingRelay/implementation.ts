import { BigInt, log } from "@graphprotocol/graph-ts";
import { Voted as VotedEvent } from "../../../generated/QuadraticFundingRelayStrategy/QuadraticFundingRelayStrategyImplementation";
import {
  QuadraticTipping,
  QFVote,
  VotingStrategy,
} from "../../../generated/schema";
import { generateID } from "../../utils";

const VERSION = "0.1.0";

/**
 * @dev Handles indexing on Voted event.
 * @param event VotedEvent
 */
export function handleRelayVote(event: VotedEvent): void {

  // load voting strategy contract
  const votingStrategyAddress = event.address;

  let votingStrategy = VotingStrategy.load(votingStrategyAddress.toHex());

  if (!votingStrategy) {
    log.warning(
      "--> handleVotingContractCreated {} {}: votingStrategy is null",
      ["QF", votingStrategyAddress.toHex()]
    );
    return;
  }

  // if (!votingStrategy.round) {
  //   log.warning("--> handleVotingContractCreated {} {}: votingStrategy.round is null", [
  //     "QF",
  //     votingStrategyAddress.toHex()
  //   ]);
  //   return;
  // }

  // // load Round contract
  // let round = Round.load(votingStrategy.round!);
  // if (!round) {
  //   log.warning("--> handleVotingContractCreated {} : round {} not found", [
  //     "QF",
  //     votingStrategy.round!
  //   ]);
  //   return;
  // }

  // create QFVote entity
  const voteID = generateID([
    event.transaction.hash.toHex(),
    event.params.grantAddress.toHex(),
  ]);
  const vote = new QFVote(voteID);

  vote.votingStrategy = votingStrategy.id;
  vote.token = event.params.token.toHex();
  vote.amount = event.params.amount;
  vote.from = event.params.voter.toHex();
  vote.to = event.params.grantAddress.toHex();
  vote.projectId = event.params.projectId.toHexString();
  vote.round = event.params.roundAddress.toHex();

  // set timestamp
  vote.createdAt = event.block.timestamp;

  vote.version = VERSION;

  vote.save();

  // if (!votingStrategy || !votingStrategy.round) {
  //   log.warning("votingStrategy or votingStrategy.round is null", []);

  // }

  let quadraticTipping = QuadraticTipping.load(
    event.params.roundAddress.toHex()
  );
  if (quadraticTipping) {
    log.info("quadraticTipping entity found: {}", [quadraticTipping.id]);
  }
  let newVote = QFVote.load(voteID);

  if (!quadraticTipping) {
    log.info("creating quadraticTipping entity: {}", [event.params.roundAddress.toHex()]);
    quadraticTipping = new QuadraticTipping(event.params.roundAddress.toHex());
    quadraticTipping.round = event.params.roundAddress.toHex();
    quadraticTipping.matchAmount = BigInt.fromI32(0);
    quadraticTipping.votes = [];
    quadraticTipping.distributions = [];
    quadraticTipping.batchPayoutCompleted = false;
    quadraticTipping.readyForPayout = false;
  }
  if (newVote) {
    log.info("newVote: {}", [newVote.id]);

    let roundVotes = quadraticTipping.votes;
    roundVotes.push(newVote.id);

    quadraticTipping.votes = roundVotes;
    quadraticTipping.save();
  }
}
