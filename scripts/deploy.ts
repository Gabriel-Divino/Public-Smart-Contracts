import { ethers } from "hardhat";


async function Euro2(){

    const euro2 = await ethers.deployContract('Euro2');
    await euro2.waitForDeployment();
    console.log(`Endereço do contrato : ${euro2.target}`);

}

Euro2().catch((err)=>{
    console.log(err);
    process.exitCode = 1;
})


