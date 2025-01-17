// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../votingStrategy/IVotingStrategy.sol";
import "../payoutStrategy/IPayoutStrategy.sol";

import "../utils/MetaPtr.sol";

/**
 * @notice Contract deployed per Round which would managed by
 * a group of ROUND_OPERATOR via the RoundFactory
 *
 */
contract RoundImplementation is AccessControlEnumerable, Initializable {
    // --- Libraries ---
    using Address for address;
    using SafeERC20 for IERC20;

    // --- Roles ---

    /// @notice round operator role
    bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");

    // --- Events ---

    /// @notice Emitted when the round metaPtr is updated
    event RoundMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

    /// @notice Emitted when the application form metaPtr is updated
    event ApplicationMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

    /// @notice Emitted when application start time is updated
    event ApplicationsStartTimeUpdated(uint256 oldTime, uint256 newTime);

    /// @notice Emitted when application end time is updated
    event ApplicationsEndTimeUpdated(uint256 oldTime, uint256 newTime);

    /// @notice Emitted when a round start time is updated
    event RoundStartTimeUpdated(uint256 oldTime, uint256 newTime);

    /// @notice Emitted when a round end time is updated
    event RoundEndTimeUpdated(uint256 oldTime, uint256 newTime);

    /// @notice Emitted when projects metaPtr is updated
    event ProjectsMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

    /// @notice Emitted when a project has applied to the round
    event NewProjectApplication(
        bytes32 indexed project,
        MetaPtr applicationMetaPtr
    );

    /**  NEW EVENTS */
    /// @notice Emitted when protocol & round fees are paid
    event EscrowFundsToPayoutContract(uint256 matchAmount);

    /// @notice Emitted when match amount is updated
    event MatchAmountUpdated(uint256 newAmount);

    // --- Modifier ---

    /// @notice modifier to check if round has not ended.
    modifier roundHasNotEnded() {
        // slither-disable-next-line timestamp
        require(block.timestamp <= roundEndTime, "error: round has ended");
        _;
    }

    /// @notice modifier to check if round has ended.
    modifier roundHasEnded() {
        require(block.timestamp > roundEndTime, "round has not ended");
        _;
    }

    // --- Data ---

    /// @notice Voting Strategy Contract Address
    IVotingStrategy public votingStrategy;

    /// @notice Payout Strategy Contract Address
    IPayoutStrategy public payoutStrategy;

    /// @notice Unix timestamp from when round can accept applications
    uint256 public applicationsStartTime;

    /// @notice Unix timestamp from when round stops accepting applications
    uint256 public applicationsEndTime;

    /// @notice Unix timestamp of the start of the round
    uint256 public roundStartTime;

    /// @notice Unix timestamp of the end of the round
    uint256 public roundEndTime;

    /// @notice Token used to payout match amounts at the end of a round
    IERC20 public token;

    /// @notice MetaPtr to the round metadata
    MetaPtr public roundMetaPtr;

    /// @notice MetaPtr to the application form schema
    MetaPtr public applicationMetaPtr;

    /// @notice MetaPtr to the projects
    MetaPtr public projectsMetaPtr;

    ///@notice amount that the round operator has agreed to match
    uint256 public matchAmount;

    // --- Core methods ---

    /**
     * @notice Instantiates a new round
     * @param encodedParameters Encoded parameters for program creation
     * @dev encodedParameters
     *  - _votingStrategy Deployed voting strategy contract
     *  - _payoutStrategy Deployed payout strategy contract
     *  - _applicationsStartTime Unix timestamp from when round can accept applications
     *  - _applicationsEndTime Unix timestamp from when round stops accepting applications
     *  - _roundStartTime Unix timestamp of the start of the round
     *  - _roundEndTime Unix timestamp of the end of the round
     *  - _token Address of the ERC20 token for accepting matching pool contributions
     *  - _roundMetaPtr MetaPtr to the round metadata
     *  - _applicationMetaPtr MetaPtr to the application form schema
     *  - _adminRoles Addresses to be granted DEFAULT_ADMIN_ROLE
     *  - _roundOperators Addresses to be granted ROUND_OPERATOR_ROLE
     */
    function initialize(bytes calldata encodedParameters) external initializer {
        // Decode _encodedParameters
        (
            IVotingStrategy _votingStrategy,
            IPayoutStrategy _payoutStrategy,
            uint256 _applicationsStartTime,
            uint256 _applicationsEndTime,
            uint256 _roundStartTime,
            uint256 _roundEndTime,
            IERC20 _token,
            MetaPtr memory _roundMetaPtr,
            MetaPtr memory _applicationMetaPtr,
            address[] memory _adminRoles,
            address[] memory _roundOperators
        ) = abi.decode(
                encodedParameters,
                (
                    IVotingStrategy,
                    IPayoutStrategy,
                    uint256,
                    uint256,
                    uint256,
                    uint256,
                    IERC20,
                    MetaPtr,
                    MetaPtr,
                    address[],
                    address[]
                )
            );

        // slither-disable-next-line timestamp
        require(
            _applicationsStartTime >= block.timestamp,
            "initialize: applications start time has already passed"
        );
        require(
            _applicationsEndTime > _applicationsStartTime,
            "initialize: application end time should be after application start time"
        );

        require(
            _roundEndTime >= _applicationsEndTime,
            "initialize: application end time should be before round end time"
        );
        require(
            _roundEndTime > _roundStartTime,
            "initialize: end time should be after start time"
        );

        require(
            _roundStartTime >= _applicationsStartTime,
            "initialize: round start time should be after application start time"
        );

        votingStrategy = _votingStrategy;
        payoutStrategy = _payoutStrategy;
        applicationsStartTime = _applicationsStartTime;
        applicationsEndTime = _applicationsEndTime;
        roundStartTime = _roundStartTime;
        roundEndTime = _roundEndTime;
        token = _token;

        // Invoke init on voting contract
        votingStrategy.init();

        // Invoke init on payout contract
        payoutStrategy.init();

        // Emit RoundMetaPtrUpdated event for indexing
        emit RoundMetaPtrUpdated(roundMetaPtr, _roundMetaPtr);
        roundMetaPtr = _roundMetaPtr;

        // Emit ApplicationMetaPtrUpdated event for indexing
        emit ApplicationMetaPtrUpdated(applicationMetaPtr, _applicationMetaPtr);
        applicationMetaPtr = _applicationMetaPtr;

        // Assigning default admin role
        for (uint256 i = 0; i < _adminRoles.length; ++i) {
            _grantRole(DEFAULT_ADMIN_ROLE, _adminRoles[i]);
        }

        // Assigning round operators
        for (uint256 i = 0; i < _roundOperators.length; ++i) {
            _grantRole(ROUND_OPERATOR_ROLE, _roundOperators[i]);
        }
    }

    // @notice Update roundMetaPtr (only by ROUND_OPERATOR_ROLE)
    /// @param newRoundMetaPtr new roundMetaPtr
    function updateRoundMetaPtr(
        MetaPtr memory newRoundMetaPtr
    ) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
        emit RoundMetaPtrUpdated(roundMetaPtr, newRoundMetaPtr);

        roundMetaPtr = newRoundMetaPtr;
    }

    // @notice Update applicationMetaPtr (only by ROUND_OPERATOR_ROLE)
    /// @param newApplicationMetaPtr new applicationMetaPtr
    function updateApplicationMetaPtr(
        MetaPtr memory newApplicationMetaPtr
    ) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
        emit ApplicationMetaPtrUpdated(
            applicationMetaPtr,
            newApplicationMetaPtr
        );

        applicationMetaPtr = newApplicationMetaPtr;
    }

    /// @notice Update roundStartTime (only by ROUND_OPERATOR_ROLE)
    /// @param newRoundStartTime new roundStartTime
    function updateRoundStartTime(
        uint256 newRoundStartTime
    ) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
        // slither-disable-next-line timestamp
        require(
            newRoundStartTime >= block.timestamp,
            "updateRoundStartTime: start time has already passed"
        );
        require(
            newRoundStartTime >= applicationsStartTime,
            "updateRoundStartTime: start time should be after application start time"
        );
        require(
            newRoundStartTime < roundEndTime,
            "updateRoundStartTime: start time should be before round end time"
        );

        emit RoundStartTimeUpdated(roundStartTime, newRoundStartTime);

        roundStartTime = newRoundStartTime;
    }

    /// @notice Update roundEndTime (only by ROUND_OPERATOR_ROLE)
    /// @param newRoundEndTime new roundEndTime
    function updateRoundEndTime(
        uint256 newRoundEndTime
    ) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
        // slither-disable-next-line timestamp
        require(
            newRoundEndTime >= block.timestamp,
            "updateRoundEndTime: end time has already passed"
        );
        require(
            newRoundEndTime > roundStartTime,
            "updateRoundEndTime: end time should be after start time"
        );
        require(
            newRoundEndTime >= applicationsEndTime,
            "updateRoundEndTime: end time should be after application end time"
        );

        emit RoundEndTimeUpdated(roundEndTime, newRoundEndTime);

        roundEndTime = newRoundEndTime;
    }

    /// @notice Update applicationsStartTime (only by ROUND_OPERATOR_ROLE)
    /// @param newApplicationsStartTime new applicationsStartTime
    function updateApplicationsStartTime(
        uint256 newApplicationsStartTime
    ) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
        // slither-disable-next-line timestamp
        require(
            newApplicationsStartTime >= block.timestamp,
            "updateApplicationsStartTime: application start time has already passed"
        );
        require(
            newApplicationsStartTime <= roundStartTime,
            "updateApplicationsStartTime: should be before round start time"
        );
        require(
            newApplicationsStartTime < applicationsEndTime,
            "updateApplicationsStartTime: should be before application end time"
        );

        emit ApplicationsStartTimeUpdated(
            applicationsStartTime,
            newApplicationsStartTime
        );

        applicationsStartTime = newApplicationsStartTime;
    }

    /// @notice Update applicationsEndTime (only by ROUND_OPERATOR_ROLE)
    /// @param newApplicationsEndTime new applicationsEndTime
    function updateApplicationsEndTime(
        uint256 newApplicationsEndTime
    ) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
        // slither-disable-next-line timestamp
        require(
            newApplicationsEndTime >= block.timestamp,
            "updateApplicationsEndTime: application end time has already passed"
        );
        require(
            newApplicationsEndTime > applicationsStartTime,
            "updateApplicationsEndTime: application end time should be after application start time"
        );
        require(
            newApplicationsEndTime <= roundEndTime,
            "updateApplicationsEndTime: should be before round end time"
        );

        emit ApplicationsEndTimeUpdated(
            applicationsEndTime,
            newApplicationsEndTime
        );

        applicationsEndTime = newApplicationsEndTime;
    }

    /// @notice Update projectsMetaPtr (only by ROUND_OPERATOR_ROLE)
    /// @param newProjectsMetaPtr new ProjectsMetaPtr
    function updateProjectsMetaPtr(
        MetaPtr calldata newProjectsMetaPtr
    ) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
        emit ProjectsMetaPtrUpdated(projectsMetaPtr, newProjectsMetaPtr);

        projectsMetaPtr = newProjectsMetaPtr;
    }

    // @notice Update match amount (only by ROUND_OPERATOR_ROLE)
    /// @param newAmount new Amount
    function updateMatchAmount(
        uint256 newAmount
    ) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
        require(
            newAmount > matchAmount,
            "Round: Lesser than current match amount"
        );

        matchAmount = newAmount;

        emit MatchAmountUpdated(newAmount);
    }

    /// @notice Submit a project application
    /// @param projectID unique hash of the project
    /// @param newApplicationMetaPtr appliction metaPtr
    function applyToRound(
        bytes32 projectID,
        MetaPtr calldata newApplicationMetaPtr
    ) roundHasNotEnded external {
        emit NewProjectApplication(projectID, newApplicationMetaPtr);
    }

    /// @notice Invoked by voter to cast votes
    /// @param encodedVotes encoded vote
    /// @dev value is to handle native token voting
    function vote(bytes[] memory encodedVotes) external payable {
        // slither-disable-next-line timestamp
        require(
            roundStartTime <= block.timestamp &&
                block.timestamp <= roundEndTime,
            "vote: round is not active"
        );

        votingStrategy.vote{value: msg.value}(encodedVotes, msg.sender);
    }

    /// @notice Pay Protocol & Round Fees and transfer funds to payout contract (only by ROUND_OPERATOR_ROLE)
    function setReadyForPayout()
        external
        payable
        roundHasEnded
        onlyRole(ROUND_OPERATOR_ROLE)
    {
        uint256 fundsInContract = _getTokenBalance(address(token));

        require(
            fundsInContract >= matchAmount,
            "Round: Not enough funds in contract"
        );

        // transfer funds to payout contract
        if (address(token) == address(0)) {
            payoutStrategy.setReadyForPayout{value: fundsInContract}();
        } else {
            IERC20(token).safeTransfer(
                address(payoutStrategy),
                fundsInContract
            );
            payoutStrategy.setReadyForPayout();
        }

        emit EscrowFundsToPayoutContract(fundsInContract);
    }

    /// @notice Withdraw funds from the contract (only by ROUND_OPERATOR_ROLE)
    /// @param tokenAddress token address
    /// @param recipent recipient address
    function withdraw(
        address tokenAddress,
        address payable recipent
    ) external onlyRole(ROUND_OPERATOR_ROLE) {
        require(
            tokenAddress != address(token),
            "Round: Cannot withdraw round token"
        );
        _transferAmount(recipent, _getTokenBalance(tokenAddress), tokenAddress);
    }

    /// @notice Util function to get token balance in the contract
    /// @param tokenAddress token address
    function _getTokenBalance(
        address tokenAddress
    ) private view returns (uint256) {
        if (tokenAddress == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(tokenAddress).balanceOf(address(this));
        }
    }

    /// @notice Util function to transfer amount to recipient
    /// @param _recipient recipient address
    /// @param _amount amount to transfer
    /// @param _tokenAddress token address
    function _transferAmount(
        address payable _recipient,
        uint256 _amount,
        address _tokenAddress
    ) private {
        if (_tokenAddress == address(0)) {
            Address.sendValue(_recipient, _amount);
        } else {
            IERC20(_tokenAddress).safeTransfer(_recipient, _amount);
        }
    }

    receive() external payable {}
}
