import { ethers } from "hardhat";


async function Euro2(){

    const euro2 = await ethers.deployContract('Euro2');
    await euro2.waitForDeployment();
    console.log(`Endereço do contrato : ${euro2.target}`);

}

async function Bets() {

    const betsAdapter = await ethers.deployContract('BetsAdapter');
    await betsAdapter.waitForDeployment();
    console.log(`Endereço do contrato : ${betsAdapter.target}`);

    const bets = await ethers.deployContract('Bets');
    await bets.waitForDeployment();
    console.log(`Endereço do contrato : ${bets.target}`);

    await betsAdapter.setProvider(bets.target);
    const provider = await betsAdapter.getProvider();
    console.log(`endereço do provider : ${provider}`);
}

Bets().catch((err)=>{
    console.log(err);
    process.exitCode = 1;
})


