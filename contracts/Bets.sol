// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./BetsLibrary.sol";
import "./IBets.sol";

//endereço do contrato : 0x1d198681971329c2Bf6E624E1Fb2578cdb011c3C
//Novo Endereço do Contrato : 0xF75FFB62Eb2f4606615cbb37E3a1dE69693B8523
//https://holesky.etherscan.io/address/0x1d198681971329c2Bf6E624E1Fb2578cdb011c3C#code
//Novo Link do Contrato : https://holesky.etherscan.io/address/0xF75FFB62Eb2f4606615cbb37E3a1dE69693B8523#code

contract Bets  is IBets{


    uint32 private index = 0;
    mapping(uint32 => BetsLibrary.Game)  private games;
    mapping(uint32 => BetsLibrary.Gambler[]) private bettors;

    address private immutable owner;

    event Played(address indexed player,uint32 gameId,string  team);
    event GameFinished(uint32 gameId,string winningTeam);

    constructor(){
        owner = tx.origin;
    }

    modifier  Authorization(){
        require(tx.origin == owner,"Access denied");
        _;
    }

    modifier findGame(uint32 id){
        require(id <= index-1,"Game not found");
        _;
    }

    function addGame(
        string memory _team1,
        string memory _team2
    ) external Authorization 
    {

        games[index]= BetsLibrary.Game({
            id:index,
            team1:_team1,
            team2:_team2,
            finished:false,
            status:"Match not held"
        });
        index+=1;

    }

    function getGame(uint32 id) external view returns(BetsLibrary.Game memory){
        return games[id];
    }

    function getGames() external view returns (BetsLibrary.Game[] memory) {
        uint32 activeCount = 0;

        for (uint32 i = 0; i < index; i++) {
            if (!games[i].finished) {
                activeCount++;
            }
        }

        BetsLibrary.Game[] memory _games = new BetsLibrary.Game[](activeCount);
        uint32 j = 0;

        for (uint32 i = 0; i < index; i++) {
            if (!games[i].finished) {
                _games[j] = games[i];
                j++;
            }
        }

        return _games;
    }

    function getBettors(uint32 id) external view returns (BetsLibrary.Gambler[] memory){
        return bettors[id];
    }

    function makeBet(uint32 id,BetsLibrary.Choice team) external payable  findGame(id) {
        
        require(tx.origin != owner,"Owner Cannot Play");
        require(msg.value == 0.01 ether,"Invalid bet: the value must be exactly 0.01 ether");
        BetsLibrary.Game memory game = games[id];

        require(game.finished == false,"Game Finished");

        BetsLibrary.Gambler memory gambler = BetsLibrary.Gambler({
            wallet:tx.origin,
            team:uint8(team),
            value : msg.value
        });

        if(bettors[id].length == 0){
            bettors[id].push(gambler);
            return;
        }
        else{
            for(uint32 i = 0; i <= bettors[id].length-1 ; i++){
                if(bettors[id][i].wallet == tx.origin){
                    revert("Bet already placed");
                }
            }
        }


        string memory chosenTeam;
        if(team == BetsLibrary.Choice.team1){
            chosenTeam = game.team1;
        }else{
            chosenTeam = game.team2;
        }

        bettors[id].push(gambler);
        emit Played(msg.sender,id,chosenTeam);

    }

    function finalizeBet(uint32 id, BetsLibrary.Choice winningTeam) 
        external Authorization findGame(id)
    {

        BetsLibrary.Game memory _game = games[id];
        require(_game.finished == false, "Game Finished");
        _game.finished = true;

        
        string memory _winningTeam;

        if (uint(winningTeam) == 0) {
            _game.status = _game.team1;
            _winningTeam = _game.team1;
        } else {
            _game.status = _game.team2;
            _winningTeam = _game.team2;
        }

        games[id] = _game;

        // Determina os vencedores
        uint256 totalBet;
        BetsLibrary.Gambler[] memory gameBettors = bettors[id];
        address[] memory winners = new address[](gameBettors.length);
        uint256 winnerCount = 0;

        for (uint32 i = 0; i < gameBettors.length; i++) {
            totalBet += gameBettors[i].value;
            if (gameBettors[i].team == uint8(winningTeam)) {
                winners[winnerCount] = gameBettors[i].wallet;
                winnerCount++;
            }
        }

        // Calcula os pagamentos
        uint256 ownerShare = (totalBet * 10) / 100;
        uint256 distributedAmount = totalBet - ownerShare;
        uint256 payments = winnerCount > 0 ? distributedAmount / winnerCount : 0;

        // Paga os vencedores
        for (uint256 i = 0; i < winnerCount; i++) {
            payable(winners[i]).transfer(payments);
        }

        // Transfere 10% para o proprietário
        payable(owner).transfer(ownerShare);
        emit GameFinished(id, _winningTeam);
    }






}