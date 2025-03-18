// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./BetsLibrary.sol";
import "./IBets.sol";



contract BetsAdapter is IBets{

    IBets private provider;
    address public immutable owner;

    constructor(){
        owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender == owner,"Access denied");
        _;
    }

    modifier ValidContract(){
        require(address(provider) != address(0),"Invalid Contract");
        _;
    }
    
    function setProvider(address newContract) external onlyOwner(){
        require(newContract != address(0),"Invalid Contract");
        provider = IBets(newContract);
    }

    function addGame(string memory _team1,string memory _team2) external onlyOwner(){
        provider.addGame(_team1, _team2);
    }

    function getGame(uint32 id) external view returns(BetsLibrary.Game memory) {
        return provider.getGame(id);
    }

    function getGames() external view returns (BetsLibrary.Game[] memory) {
        return provider.getGames();
    }

    function getBettors(uint32 id) external view returns (BetsLibrary.Gambler[] memory) {
        return provider.getBettors(id);
    }

    function makeBet(uint32 id,BetsLibrary.Choice team) external payable{
        provider.makeBet{value : msg.value}(id, team);
    }

    function finalizeBet(uint32 id, BetsLibrary.Choice winningTeam) external onlyOwner(){
        provider.finalizeBet(id, winningTeam);
    }

    function getProvider() external view ValidContract() returns  (address)  {
        return address(provider);
    }


}

