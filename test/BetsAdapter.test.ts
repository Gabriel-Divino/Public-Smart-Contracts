import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

interface TeamInterface{

    team1:string;
    team2:string;
}


describe('BetsApdater',()=>{



    async function deployFixture() {
        const [owner, account1 , account2] = await hre.ethers.getSigners();

        
        const BetsApdater = await hre.ethers.getContractFactory("BetsAdapter");
        const betsAdapter = await BetsApdater.deploy();
    
        const Bets = await hre.ethers.getContractFactory("Bets");
        const bets = await Bets.deploy();
    
        return { bets, betsAdapter , owner, account1 , account2  };
    }

    it('setProvider (success)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        await betsAdapter.setProvider(bets.target);
        const address : string = await betsAdapter.getProvider();
        expect(address).to.equal(bets.target);
    })

    it('get Owner', async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        const getOwner = await betsAdapter.getOwner();
        expect(getOwner).to.equal(owner.address);
    })

    it('setProvider (error : Access denied)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        const instance = betsAdapter.connect(account1);
        await expect(instance.setProvider(bets.target)).to.rejectedWith('Access denied');
    })

    it('setProvider (error : Invalid Contract)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        const contract : string =  ethers.ZeroAddress;
        await expect(betsAdapter.setProvider(contract)).to.rejectedWith('Invalid Contract');
    })



    it('add game (success)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        //console.log(bets.target)
        await betsAdapter.setProvider(bets.target);
        const games : TeamInterface[] = [
            {
                team1 : "Barcelona",
                team2 : "Real Madrid"
            },
            {
                team1 : "Manchester City",
                team2 : "Arsenal"
            }
        ]

        await betsAdapter.addGame(games[0].team1,games[0].team2);
        await betsAdapter.addGame(games[1].team1,games[1].team2);
    })


    it('add game (error : Access denied)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        //console.log(bets.target)
        await betsAdapter.setProvider(bets.target);
        const games : TeamInterface[] = [
            {
                team1 : "Barcelona",
                team2 : "Real Madrid"
            },
            {
                team1 : "Manchester City",
                team2 : "Arsenal"
            }
        ]
        const instance = betsAdapter.connect(account1);
        await expect(instance.addGame(games[0].team1,games[0].team2)).to.rejectedWith('Access denied');
    })


    it('get game (success - only)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        //console.log(bets.target)
        await betsAdapter.setProvider(bets.target);
        const games : TeamInterface[] = [
            {
                team1 : "Barcelona",
                team2 : "Real Madrid"
            },
            {
                team1 : "Manchester City",
                team2 : "Arsenal"
            }
        ]

        await betsAdapter.addGame(games[0].team1,games[0].team2);
        await betsAdapter.addGame(games[1].team1,games[1].team2);

        const game1 = await betsAdapter.getGame(0);
        expect(game1.team1).to.equal(games[0].team1);

    })

    it('get games (success)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        //console.log(bets.target)
        await betsAdapter.setProvider(bets.target);
        const games : TeamInterface[] = [
            {
                team1 : "Barcelona",
                team2 : "Real Madrid"
            },
            {
                team1 : "Manchester City",
                team2 : "Arsenal"
            }
        ]

        await betsAdapter.addGame(games[0].team1,games[0].team2);
        await betsAdapter.addGame(games[1].team1,games[1].team2);

        const _games = await betsAdapter.getGames();
        expect(_games[0].team1).to.equal(games[0].team1);
        expect(_games[1].team1).to.equal(games[1].team1);
    })


    it('make Bet and get Bettors (success)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        //console.log(bets.target)
        await betsAdapter.setProvider(bets.target);
        const games : TeamInterface[] = [
            {
                team1 : "Barcelona",
                team2 : "Real Madrid"
            },
            {
                team1 : "Manchester City",
                team2 : "Arsenal"
            }
        ]

        await betsAdapter.addGame(games[0].team1,games[0].team2);
        await betsAdapter.addGame(games[1].team1,games[1].team2);

        const bet1 = betsAdapter.connect(account1);
        const bet2 = betsAdapter.connect(account2);

        const value : bigint = ethers.parseEther('0.01');

        await bet1.makeBet(0,0,{value : value});
        await bet2.makeBet(0,1,{value : value});

        const bettors = await betsAdapter.getBettors(0);
        expect(bettors[0].wallet).to.equal(account1.address);
        expect(bettors[0].team).to.equal(0);
        expect(bettors[1].wallet).to.equal(account2.address);
        expect(bettors[1].team).to.equal(1);
        

    }) 


    it('make Bet  (error : Owner Cannot Play)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        //console.log(bets.target)
        await betsAdapter.setProvider(bets.target);
        const games : TeamInterface[] = [
            {
                team1 : "Barcelona",
                team2 : "Real Madrid"
            },
            {
                team1 : "Manchester City",
                team2 : "Arsenal"
            }
        ]

        await betsAdapter.addGame(games[0].team1,games[0].team2);
        await betsAdapter.addGame(games[1].team1,games[1].team2);


        const value : bigint = ethers.parseEther('0.01');
        await expect(betsAdapter.makeBet(0,0,{value : value})).to.revertedWith('Owner Cannot Play');

    }) 
    
    it('make Bet  (error : Invalid bet: the value must be exactly 0.01 ether)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        //console.log(bets.target)
        await betsAdapter.setProvider(bets.target);
        const games : TeamInterface[] = [
            {
                team1 : "Barcelona",
                team2 : "Real Madrid"
            },
            {
                team1 : "Manchester City",
                team2 : "Arsenal"
            }
        ]

        await betsAdapter.addGame(games[0].team1,games[0].team2);
        await betsAdapter.addGame(games[1].team1,games[1].team2);
        const value : bigint = ethers.parseEther('1');

        const instance = betsAdapter.connect(account1);

        await expect(instance.makeBet(0,0,{value : value})).to.revertedWith('Invalid bet: the value must be exactly 0.01 ether');

    }) 

    
    it('make Bet  (error : Game Finished)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        //console.log(bets.target)
        await betsAdapter.setProvider(bets.target);
        const games : TeamInterface[] = [
            {
                team1 : "Barcelona",
                team2 : "Real Madrid"
            },
            {
                team1 : "Manchester City",
                team2 : "Arsenal"
            }
        ]

        await betsAdapter.addGame(games[0].team1,games[0].team2);
        await betsAdapter.addGame(games[1].team1,games[1].team2);
        await betsAdapter.finalizeBet(0,0);
        const value : bigint = ethers.parseEther('0.01');

        const instance = betsAdapter.connect(account1);

        await expect(instance.makeBet(0,0,{value : value})).to.revertedWith('Game Finished');

    })

    it('make Bet  (error : Bet already placed)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        //console.log(bets.target)
        await betsAdapter.setProvider(bets.target);
        const games : TeamInterface[] = [
            {
                team1 : "Barcelona",
                team2 : "Real Madrid"
            },
            {
                team1 : "Manchester City",
                team2 : "Arsenal"
            }
        ]

        await betsAdapter.addGame(games[0].team1,games[0].team2);
        await betsAdapter.addGame(games[1].team1,games[1].team2);
        const value : bigint = ethers.parseEther('0.01');
        const instance = betsAdapter.connect(account1);
        await instance.makeBet(0,0,{value : value});

        await expect(instance.makeBet(0,1,{value : value})).to.revertedWith('Bet already placed');

    })

    it('finalize Bet  (success)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        //console.log(bets.target)
        await betsAdapter.setProvider(bets.target);
        const games : TeamInterface[] = [
            {
                team1 : "Barcelona",
                team2 : "Real Madrid"
            },
            {
                team1 : "Manchester City",
                team2 : "Arsenal"
            }
        ]

        await betsAdapter.addGame(games[0].team1,games[0].team2);
        await betsAdapter.addGame(games[1].team1,games[1].team2);
        const value : bigint = ethers.parseEther('0.01');
        
        const bet1 =  betsAdapter.connect(account1);
        const bet2 =  betsAdapter.connect(account2);



        await bet1.makeBet(0,0,{value : value});
        await bet2.makeBet(0,1,{value : value});

        await betsAdapter.finalizeBet(0,0);


        const game1 = await betsAdapter.getGame(0);


        expect(game1.finished).to.equal(true);
        expect(game1.status).to.equal(games[0].team1);

    })

    it('finalize Bet  (error : Game Finished)',async () =>{
        const { bets, betsAdapter , owner, account1 , account2 } = await deployFixture();
        //console.log(bets.target)
        await betsAdapter.setProvider(bets.target);
        const games : TeamInterface[] = [
            {
                team1 : "Barcelona",
                team2 : "Real Madrid"
            },
            {
                team1 : "Manchester City",
                team2 : "Arsenal"
            }
        ]

        await betsAdapter.addGame(games[0].team1,games[0].team2);
        await betsAdapter.addGame(games[1].team1,games[1].team2);
        const value : bigint = ethers.parseEther('0.01');
        
        const bet1 =  betsAdapter.connect(account1);
        const bet2 =  betsAdapter.connect(account2);



        await bet1.makeBet(0,0,{value : value});
        await bet2.makeBet(0,1,{value : value});

        await betsAdapter.finalizeBet(0,0);


        const game1 = await betsAdapter.getGame(0);


        expect(game1.finished).to.equal(true);
        expect(game1.status).to.equal(games[0].team1);
        await expect(betsAdapter.finalizeBet(0,1)).to.rejectedWith('Game Finished');

    })


    



})