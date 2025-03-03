// SPDX-License-Identifier: MIT

pragma solidity >=0.8.12 <0.9.0;

import  {Ownable} from  "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//Endereço do contrato : 0x3413fCBf8C40771C37F21Fe0a2c25D49FB703EBe
//https://holesky.etherscan.io/address/0x3413fCBf8C40771C37F21Fe0a2c25D49FB703EBe

contract Euro2  is Ownable , ERC20{

    uint256 public paymentValue = 100;
    uint256 public paymentDelay = 60 * 60 * 24;

    mapping(address => uint256) private payments;
    

    constructor() ERC20("Euro",unicode"€") Ownable(msg.sender) {

    }

    function mint(uint256 value) public  onlyOwner() {
        _mint(address(this),value);   
    }

    function transferUser(address wallet) public onlyOwner(){

        require(payments[wallet] < block.timestamp,"Please wait 24 hours after receipt");
        payments[wallet] = block.timestamp + paymentDelay;
        _transfer(address(this),wallet,paymentValue);
    }

    function setPaymentValue(uint256 newValue) public onlyOwner(){
        paymentValue = newValue;
    }

    function setPaymentDelay(uint256 newPaymentDelay) public onlyOwner(){
        paymentDelay = newPaymentDelay;
    }

    function getDelay() public view returns(uint256){
        return payments[msg.sender];
    }


}