import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

interface GameInterface{

    team1 : string;
    team2 : string;
    finished : boolean;
    status : string;
}

interface GamblerInterface{

    wallet : string;
    team : bigint;
    value : bigint;
}

describe("Bet", function(){

    async function deployFixture() {
        const [owner, account1 , account2] = await hre.ethers.getSigners();
    
        const Bet = await hre.ethers.getContractFactory("Bet");
        const bet = await Bet.deploy();
    
        return { bet, owner, account1 , account2  };
    }

    it("Add Game (success)",async function(){

        const { bet, owner, account1 , account2  } = await deployFixture();
        const teams : string[] = ["Barcelona","Real Madrid"];
        await bet.addGame(teams[0],teams[1]);
        const game1 : GameInterface = await bet.games(0);
        expect(game1.team1).to.equal(teams[0]);

    })

    it("Add Game (error)",async function(){

        const { bet, owner, account1 , account2  } = await deployFixture();
        const contract =  bet.connect(account1);
        const teams : string[] = ["Barcelona","Real Madrid"];
        await expect(contract.addGame(teams[0],teams[1])).to.revertedWith("Acesso Negado");

    })

    it('Make Bet (error : not found)',async function () {
        const { bet, owner, account1 , account2  } = await deployFixture();
        const contract = bet.connect(account1);

        const teams : string[] = ["Barcelona","Real Madrid"];
        await bet.addGame(teams[0],teams[1]);

        await expect(contract.makeBet(1,0)).to.revertedWith('Jogo nao encontrado');
    })

    it('Make Bet (error : owner cannot bet)',async function () {
        const { bet, owner, account1 , account2  } = await deployFixture();

        const teams : string[] = ["Barcelona","Real Madrid"];
        await bet.addGame(teams[0],teams[1]);

        await expect(bet.makeBet(0,0)).to.revertedWith('Proprietario nao Pode Jogar');
    })

    it('Make Bet (error : balance must not be different from 0.01)',async function () {
        const { bet, owner, account1 , account2  } = await deployFixture();
        const contract = bet.connect(account1);

        const teams : string[] = ["Barcelona","Real Madrid"];
        await bet.addGame(teams[0],teams[1]);

        await expect(contract.makeBet(0,0)).to.revertedWith('Aposta invalida: o valor deve ser exatamente 0.01 ether');
    })

    it("Make Bet (success)" , async function () {
        const { bet, owner, account1 , account2  } = await deployFixture();
        const contract = bet.connect(account1);

        const teams : string[] = ["Barcelona","Real Madrid"];
        await bet.addGame(teams[0],teams[1]);
        const value : bigint = ethers.parseEther("0.01");
        await contract.makeBet(0,0,{value:value});

        const bettors : GamblerInterface = await bet.bettors(0,0);
        expect(bettors.wallet).to.equal(account1.address);
    })

    it("Make Bet (error : Bet already placed)" , async function () {
        const { bet, owner, account1 , account2  } = await deployFixture();
        const contract = bet.connect(account1);

        const teams : string[] = ["Barcelona","Real Madrid"];
        await bet.addGame(teams[0],teams[1]);
        const value : bigint = ethers.parseEther("0.01");
        await contract.makeBet(0,0,{value:value});

        await expect(contract.makeBet(0,0,{value:value})).to.revertedWith("Aposta ja Realizada");
    })

    it("Finalize Bet (error : Access denied)" , async function () {

        const { bet, owner, account1 , account2  } = await deployFixture();
        const teams : string[] = ["Barcelona","Real Madrid"];
        await bet.addGame(teams[0],teams[1]);

        const contract1 = bet.connect(account1);
        const contract2 = bet.connect(account2);
        const value : bigint = ethers.parseEther("0.01");

        await contract1.makeBet(0,0,{value:value});
        await contract2.makeBet(0,1,{value:value});

        await expect(contract1.finalizeBet(0,0)).to.revertedWith('Acesso Negado');


    })

    it("Finalize Bet (success)" , async function () {

        const { bet, owner, account1 , account2  } = await deployFixture();
        const teams : string[] = ["Barcelona","Real Madrid"];
        await bet.addGame(teams[0],teams[1]);

        const contract1 = bet.connect(account1);
        const contract2 = bet.connect(account2);
        const value : bigint = ethers.parseEther("0.01");

        await contract1.makeBet(0,0,{value:value});
        await contract2.makeBet(0,1,{value:value});

        await bet.finalizeBet(0,1);

        const game1 : GameInterface = await bet.games(0);

        await expect(game1.finished).to.equal(true);


    })

    it("Finalize Bet (error : game not found)" , async function () {

        const { bet, owner, account1 , account2  } = await deployFixture();
        const teams : string[] = ["Barcelona","Real Madrid"];
        await bet.addGame(teams[0],teams[1]);

        const contract1 = bet.connect(account1);
        const contract2 = bet.connect(account2);
        const value : bigint = ethers.parseEther("0.01");

        await contract1.makeBet(0,0,{value:value});
        await contract2.makeBet(0,1,{value:value});


        await expect(bet.finalizeBet(1,1)).to.revertedWith("Jogo nao encontrado");


    })

    it("Finalize Bet (error : game finished)" , async function () {

        const { bet, owner, account1 , account2  } = await deployFixture();
        const teams : string[] = ["Barcelona","Real Madrid"];
        await bet.addGame(teams[0],teams[1]);

        const contract1 = bet.connect(account1);
        const contract2 = bet.connect(account2);
        const value : bigint = ethers.parseEther("0.01");

        await contract1.makeBet(0,0,{value:value});
        await contract2.makeBet(0,1,{value:value});

        await bet.finalizeBet(0,1);
        await expect(bet.finalizeBet(0,0)).to.revertedWith('Jogo Finalizado');

    })

    it('Get Games (with games)' , async function () {

        const { bet, owner, account1 , account2  } = await deployFixture();
        const teams : string[] = ["Barcelona","Real Madrid"];
        await bet.addGame(teams[0],teams[1]);
        await bet.addGame("Arsenal","Liverpool"); 

        const games : GameInterface[] = await bet.getGames();
        //console.log(games)
        expect(games.length).to.equal(2);
        
    })

    it('Get Games (empty)' , async function () {

        const { bet, owner, account1 , account2  } = await deployFixture();
        const teams : string[] = ["Barcelona","Real Madrid"];

        const games : GameInterface[] = await bet.getGames();
        expect(games.length).to.equal(0);
        
    })


})


