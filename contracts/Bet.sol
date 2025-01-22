// SPDX-License-Identifier: MIT
//Link do contrato : https://holesky.etherscan.io/address/0xeEda6317e11a1222Bb5f04ef12a445CaBF36A389
//Contrato publicado via Remix

pragma solidity >=0.8.12 <0.9.0;


contract Bet {

    struct Gambler{

        address wallet;
        uint8 team;
        uint value;
        
    }

    struct Game{

        string team1;
        string team2;
        bool finished;
        string status;
    }

    enum Choice{
        team1,team2
    }

    uint32 public index = 0;
    mapping(uint32 => Game)  public games;
    mapping(uint32 => Gambler[]) public bettors;

    address private immutable owner;

    constructor(){
        owner = msg.sender;
    }

    modifier  Authorization(){
        require(msg.sender == owner,"Acesso Negado");
        _;
    }

    modifier findGame(uint32 id){
        require(id <= index-1,"Jogo nao encontrado");
        _;
    }

    function addGame(
        string memory _team1,
        string memory _team2
    ) public Authorization 
    {

        games[index]= Game({
            team1:_team1,
            team2:_team2,
            finished:false,
            status:"Partida nao realizada"
        });
        index+=1;

    }

    function getGames() public view returns (Game[] memory) {
        uint32 activeCount = 0;

        for (uint32 i = 0; i < index; i++) {
            if (!games[i].finished) {
                activeCount++;
            }
        }

        Game[] memory _games = new Game[](activeCount);
        uint32 j = 0;

        for (uint32 i = 0; i < index; i++) {
            if (!games[i].finished) {
                _games[j] = games[i];
                j++;
            }
        }

        return _games;
    }

    function makeBet(uint32 id,Choice team) public payable  findGame(id) {
        
        require(msg.sender != owner,"Proprietario nao Pode Jogar");
        require(msg.value == 0.01 ether,"Aposta invalida: o valor deve ser exatamente 0.01 ether");
        Game memory game = games[id];

        require(game.finished == false,"Jogo Finalizado");

        Gambler memory gambler = Gambler({
            wallet:msg.sender,
            team:uint8(team),
            value : msg.value
        });

        if(bettors[id].length == 0){
            bettors[id].push(gambler);
            return;
        }
        else{
            for(uint32 i = 0; i <= bettors[id].length-1 ; i++){
                if(bettors[id][i].wallet == msg.sender){
                    revert("Aposta ja Realizada");
                }
            }
        }

        bettors[id].push(gambler);

    }

    function finalizeBet(uint32 id, Choice winningTeam) 
        public Authorization findGame(id)
    {
        require(games[id].finished == false, "Jogo Finalizado");
        games[id].finished = true;

        if (uint(winningTeam) == 0) {
            games[id].status = games[id].team1;
        } else {
            games[id].status = games[id].team2;
        }

        // Determina os vencedores
        uint256 totalBet;
        Gambler[] memory gameBettors = bettors[id];
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
    }






}