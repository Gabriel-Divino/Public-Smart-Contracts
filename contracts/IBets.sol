// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./BetsLibrary.sol";

interface IBets{

    function addGame(string memory _team1,string memory _team2) external;
    function getGame(uint32 id) external view returns(BetsLibrary.Game memory);
    function getGames() external view returns (BetsLibrary.Game[] memory);
    function getBettors(uint32 id) external view returns (BetsLibrary.Gambler[] memory);
    function makeBet(uint32 id,BetsLibrary.Choice team) external payable;
    function finalizeBet(uint32 id, BetsLibrary.Choice winningTeam) external;

}