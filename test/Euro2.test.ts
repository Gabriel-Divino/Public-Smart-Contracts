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
    
        const Euro = await hre.ethers.getContractFactory("Euro2");
        const euro = await Euro.deploy();
    
        return { euro, owner, account1 , account2  };
    }


    it('Must have a name', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();

        const name : string = await euro.name();
        expect(name).to.equal('Euro');
    })

    it('Must have a symbol', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();

        const name : string = await euro.symbol();
        expect(name).to.equal('€');
    })

    it('mint (success)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();

        const mintValue : bigint = 1_000_000n * 10n ** 18n;

        const balances : bigint[] = [await euro.balanceOf(euro.target)];

        await euro.mint(mintValue);
        balances.push(await euro.balanceOf(euro.target));

        expect(balances[0]).to.equal(0n);
        expect(balances[1]).to.equal(mintValue);
        
    })

    it('mint (error : OwnableUnauthorizedAccount)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();

        const mintValue : bigint = 1_000_000n * 10n ** 18n;

        const instance = euro.connect(account1);

        await expect(instance.mint(mintValue)).to.rejectedWith('OwnableUnauthorizedAccount');
        
    })

    it('transferUser (success : one payment only)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();

        const mintValue : bigint = 1_000_000n * 10n ** 18n;
        const paymentValue : bigint = 100n;

        await euro.mint(mintValue);

        const balances : bigint[] = [await euro.balanceOf(account1.address)];

        await euro.transferUser(account1.address);
        balances.push(await euro.balanceOf(account1.address));

        expect(balances[0]).to.equal(0n);
        expect(balances[1]).to.equal(paymentValue);
        
    })


    it('transferUser (error : OwnableUnauthorizedAccount)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();

        const mintValue : bigint = 1_000_000n * 10n ** 18n;


        await euro.mint(mintValue);

        const instance = euro.connect(account1);        

        await expect(instance.transferUser(account1.address)).to.rejectedWith('OwnableUnauthorizedAccount');
        
    })

    it('transferUser (error : ERC20InsufficientBalance)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        await expect(euro.transferUser(account1.address)).to.rejectedWith('ERC20InsufficientBalance');
    })

    it('transferUser (error : Please wait 24 hours after receipt)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();

        const mintValue : bigint = 1_000_000n * 10n ** 18n;


        await euro.mint(mintValue);


        await euro.transferUser(account1.address);
        await expect(euro.transferUser(account1.address)).to.rejectedWith('Please wait 24 hours after receipt');
        
    })

    it('transferUser (success : payment after 24 hours)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();

        const mintValue : bigint = 1_000_000n * 10n ** 18n;
        const paymentValue : bigint = 100n;


        await euro.mint(mintValue);
        const balances : bigint[] = [await euro.balanceOf(account1.address)];

        await euro.transferUser(account1.address);
        await time.increase(60 *  60 * 24);
        await euro.transferUser(account1.address);
        balances.push(await euro.balanceOf(account1.address));
        expect(balances[0]).to.equal(0n);
        expect(balances[1]).to.equal(paymentValue * 2n);
        
    })

    it('setPaymentValue (success)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const newPaymentValue = 10n;
        const paymentValue : bigint[] = [await euro.paymentValue()];

        await euro.setPaymentValue(newPaymentValue);
        paymentValue.push(await euro.paymentValue());

        expect(paymentValue[0]).to.equal(100n);
        expect(paymentValue[1]).to.equal(newPaymentValue);

        
    })

    it('setPaymentValue (error : OwnableUnauthorizedAccount)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();

        const instance = euro.connect(account1);

        await expect(instance.setPaymentValue(10n)).to.rejectedWith('OwnableUnauthorizedAccount');
        
    })

    it('setPaymentDelay (success)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const newDelay : bigint = 60n * 60n * 48n;
        const currentDelay : bigint = 60n * 60n * 24n;
        const delay : bigint[] = [await euro.paymentDelay()];

        await euro.setPaymentDelay(newDelay);
        delay.push(await euro.paymentDelay());

        expect(delay[0]).to.equal(currentDelay);
        expect(delay[1]).to.equal(newDelay);
        
    })

    it('setPaymentDelay (error : OwnableUnauthorizedAccount)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();
        const newDelay : bigint = 60n * 60n * 48n;
        
        const instance = euro.connect(account1);

        await expect(instance.setPaymentDelay(newDelay)).to.rejectedWith('OwnableUnauthorizedAccount');
        
    })

    it('getDelay (success)', async () =>{
        const { euro, owner, account1 , account2  } = await deployFixture();

        const mintValue : bigint = 1_000_000n * 10n ** 18n;

        await euro.mint(mintValue);

        await euro.transferUser(account1.address);
        const instance = euro.connect(account1);

        const delay = await instance.getDelay();
        console.log(delay);
        
    })

})