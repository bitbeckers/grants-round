import {
  test,
  assert,
  newMockEvent,
  describe,
  beforeEach,
  clearStore,
  afterEach,
} from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleVote } from "../../../src/votingStrategy/quadraticFundingRelay/implementation";
import { Voted as VotedEvent } from "../../../generated/QuadraticFundingRelayStrategy/QuadraticFundingRelayStrategyImplementation";
import { QFVote, Round, VotingStrategy } from "../../../generated/schema";
import { generateID } from "../../../src/utils";
import { Bytes } from "@graphprotocol/graph-ts";

let token: Address;
let amount: BigInt;
let voter: Address;
let grantAddress: Address;
let roundAddress: Address;
let projectId: Bytes;

let newVoteEvent: VotedEvent;

let votingStrategyAddress: Address;

function createNewVotedEvent(
  token: Address,
  amount: BigInt,
  voter: Address,
  grantAddress: Address,
  projectId: Bytes,
  roundAddress: Address,
  votingStrategyAddress: Address
): VotedEvent {
  const newVoteEvent = changetype<VotedEvent>(newMockEvent());

  const tokenParam = new ethereum.EventParam(
    "token",
    ethereum.Value.fromAddress(token)
  );
  const amountParam = new ethereum.EventParam(
    "amount",
    ethereum.Value.fromUnsignedBigInt(amount)
  );
  const voterParam = new ethereum.EventParam(
    "voter",
    ethereum.Value.fromAddress(voter)
  );
  const grantAddressParam = new ethereum.EventParam(
    "grantAddress",
    ethereum.Value.fromAddress(grantAddress)
  );
  const projectIdParam = new ethereum.EventParam(
    "projectId",
    ethereum.Value.fromBytes(projectId)
  );
  const roundAddressParam = new ethereum.EventParam(
    "roundAddress",
    ethereum.Value.fromAddress(roundAddress)
  );

  newVoteEvent.parameters.push(tokenParam);
  newVoteEvent.parameters.push(amountParam);
  newVoteEvent.parameters.push(voterParam);
  newVoteEvent.parameters.push(grantAddressParam);
  newVoteEvent.parameters.push(projectIdParam);
  newVoteEvent.parameters.push(roundAddressParam);

  newVoteEvent.address = votingStrategyAddress;

  return newVoteEvent;
}

describe("handleVote", () => {
  beforeEach(() => {
    amount = new BigInt(1);
    token = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A");
    voter = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2B");
    grantAddress = Address.fromString(
      "0xA16081F360e3847006dB660bae1c6d1b2e17eC2D"
    );
    roundAddress = Address.fromString(
      "0xA16081F360e3847006dB660bae1c6d1b2e17eC2E"
    );
    projectId = Bytes.fromHexString("0x72616e646f6d50726f6a6563744964"); // bytes32 projectId

    // Create VotingStrategy entity
    votingStrategyAddress = Address.fromString(
      "0xB16081F360e3847006dB660bae1c6d1b2e17eC2A"
    );

    const votingStrategyEntity = new VotingStrategy(
      votingStrategyAddress.toHex()
    );
    votingStrategyEntity.strategyName = "LINEAR_QUADRATIC_FUNDING";
    votingStrategyEntity.strategyAddress =
      "0xA16081F360e3847006dB660bae1c6d1b2e17eC2G";
    votingStrategyEntity.version = "0.1.0";
    votingStrategyEntity.save();

    // Create Round entity
    const roundEntity = new Round(roundAddress.toHex());
    roundEntity.program = "0xB16081F360e3847006dB660bae1c6d1b2e17eC2B";
    roundEntity.votingStrategy = votingStrategyEntity.id;
    roundEntity.payoutStrategy = "0xB16081F360e3847006dB660bae1c6d1b2e17eC2C";
    roundEntity.applicationsStartTime = new BigInt(10).toString();
    roundEntity.applicationsEndTime = new BigInt(20).toString();
    roundEntity.roundStartTime = new BigInt(30).toString();
    roundEntity.roundEndTime = new BigInt(40).toString();
    roundEntity.token = "0xB16081F360e3847006dB660bae1c6d1b2e17eC2D";
    roundEntity.roundMetaPtr = "roundMetaPtr";
    roundEntity.applicationMetaPtr = "applicationMetaPtr";
    roundEntity.createdAt = new BigInt(1);
    roundEntity.updatedAt = new BigInt(2);

    roundEntity.save();

    // Link VotingStrategy to Round entity
    votingStrategyEntity.round = roundEntity.id;
    votingStrategyEntity.save();

    newVoteEvent = createNewVotedEvent(
      token,
      amount,
      voter,
      grantAddress,
      projectId,
      roundAddress,
      votingStrategyAddress
    );
  });

  afterEach(() => {
    clearStore();
  });

  test("QFVote entity is created when handleVote is called", () => {
    handleVote(newVoteEvent);

    const id = generateID([
      newVoteEvent.transaction.hash.toHex(),
      grantAddress.toHex(),
    ]);
    newVoteEvent.transaction.hash.toHex();
    const qfVote = QFVote.load(id);
    assert.assertNotNull(qfVote);

    assert.entityCount("QFVote", 1);
    assert.stringEquals(qfVote!.id, id);
  });

  test("init values are set correctly when handleVote is called", () => {
    handleVote(newVoteEvent);

    const id = generateID([
      newVoteEvent.transaction.hash.toHex(),
      grantAddress.toHex(),
    ]);
    const qfVote = QFVote.load(id);

    assert.stringEquals(qfVote!.votingStrategy, votingStrategyAddress.toHex());
    assert.stringEquals(qfVote!.token, token.toHex());
    assert.bigIntEquals(qfVote!.amount, amount);
    assert.stringEquals(qfVote!.from, voter.toHex());
    assert.stringEquals(qfVote!.to, grantAddress.toHex());
    assert.bytesEquals(Bytes.fromHexString(qfVote!.projectId), projectId);
    assert.stringEquals(qfVote!.version, "0.1.0");
  });

  test("QF vote is linked to VotingStrategy when handledVote is called", () => {
    handleVote(newVoteEvent);

    const id = generateID([
      newVoteEvent.transaction.hash.toHex(),
      grantAddress.toHex(),
    ]);
    const qfVote = QFVote.load(id);
    const votingStrategy = VotingStrategy.load(qfVote!.votingStrategy);

    assert.assertNotNull(votingStrategy);
  });

  test("created 2 QF votes when 2 when handledVote is called twice", () => {
    const anotherAmount = new BigInt(10);
    const anotherGrantAddress = Address.fromString(
      "0xB16081F360e3847006dB660bae1c6d1b2e17eC2A"
    );

    const anotherVoteEvent = createNewVotedEvent(
      token,
      anotherAmount,
      voter,
      anotherGrantAddress,
      projectId,
      roundAddress,
      votingStrategyAddress
    );

    handleVote(newVoteEvent);
    handleVote(anotherVoteEvent);

    const id = generateID([
      newVoteEvent.transaction.hash.toHex(),
      grantAddress.toHex(),
    ]);
    assert.assertNotNull(QFVote.load(id));

    const anotherId = generateID([
      newVoteEvent.transaction.hash.toHex(),
      grantAddress.toHex(),
    ]);
    assert.assertNotNull(QFVote.load(anotherId));
  });
});
