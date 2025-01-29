import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const EuroModule = buildModule("Euro", (m) => {


  const euro = m.contract("Euro");

  return { euro };
});

export default EuroModule;
//0x5FbDB2315678afecb367f032d93F642f64180aa3 contrato na rede local