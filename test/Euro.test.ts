import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";


describe('Euro',()=>{


    function getDecimals(value : bigint) : bigint{
        return value   * 10n ** 18n;
    }

    async function deployFixture() {
        const [owner, account1 , account2] = await hre.ethers.getSigners();
    
        const Euro = await hre.ethers.getContractFactory("Euro");
        const euro = await Euro.deploy();
    
        return { euro, owner, account1 , account2  };
    }


    it('Must have a name', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();

        const name : string = await euro.name();
        expect(name).to.equal('Euro');
    })

    
    it('Must have symbol', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const symbol : string = await euro.symbol();
        expect(symbol).to.equal('€');
    })

    it('Must have decimals', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const decimals : bigint = await euro.decimals();
        expect(decimals).to.equal(18);
    })

    it('Must have decimals', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const totalSupply : bigint = await euro.totalSupply();
        const value  : bigint = 1_000_000_000n * 10n ** 18n;
        expect(totalSupply).to.equal(value);
    })

    it("owner's wallet must receive funds in the builder", async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const value  : bigint = 1_000_000_000n * 10n ** 18n;
        const ownerBalance : bigint = await euro.balanceOf(owner.address);
        expect(ownerBalance).to.equal(value);
    })

    it('transfer must be valid' , async () =>{

        const { euro, owner, account1 , account2  } = await deployFixture();
        const totalSupply : bigint = await euro.totalSupply();
        const value : bigint = getDecimals(10n);


        await euro.transfer(account1.address,value);

        const ownerBalance : bigint = await euro.balanceOf(owner.address);
        const account1Balance : bigint = await euro.balanceOf(account1.address);

        expect(ownerBalance).to.equal(totalSupply -  value);
        expect(account1Balance).to.equal(value);

    })

    it('invalid transfer (Insufficient balance)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const instance = euro.connect(account1);
        await expect(instance.transfer(account2.address,1n)).to.revertedWith('Insufficient balance');
    })

    it('approve (success)' , async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const value : bigint = getDecimals(10n);

        await euro.approve(account1.address,value);

        const allowance : bigint = await euro.allowance(owner.address,account1.address);
        expect(allowance).to.equal(value);
    })

    it('approve (Insufficient balance)' , async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const value : bigint = getDecimals(10n);

        const instance = euro.connect(account1);

        await expect(instance.approve(account2.address,value)).to.rejectedWith("Insufficient balance");
    })

    it("transferFrom (success)" , async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const totalSupply : bigint = await euro.totalSupply();
        const value : bigint = getDecimals(100n);
        const transferredValue : bigint =  getDecimals(10n);

        await euro.approve(account1.address,value);
        
        const instance = euro.connect(account1);

        await instance.transferFrom(owner.address,account2.address,transferredValue);
        const ownerBalance  : bigint = await euro.balanceOf(owner.address);
        const allowance :  bigint = await euro.allowance(owner.address,account1.address);

        const account2Balance : bigint = await euro.balanceOf(account2.address);

        expect(ownerBalance).to.equal(totalSupply - transferredValue);
        expect(allowance).to.equal(value - transferredValue);
        expect(account2Balance).to.equal(transferredValue);

        
    })

    it('transfer from (error : Insufficient balance)' , async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const totalSupply : bigint = await euro.totalSupply();

        await euro.approve(account1.address,totalSupply);

        const instance = euro.connect(account1);

        await expect(instance.transferFrom(owner.address,account2.address,totalSupply + 1n))
            .to.revertedWith('Insufficient balance');
    })

    it('transfer from (error : Denied Value)' , async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const instance = euro.connect(account1);
        await expect(instance.transferFrom(owner.address,account2.address,getDecimals(10n)))
            .to.revertedWith('Denied Value');
    })

})