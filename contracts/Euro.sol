// SPDX-License-Identifier: MIT

pragma solidity >=0.8.12 <0.9.0;
// Endereço do contrato na rede Holesky : 0xda377C69a11ec45A947086c6991aa343C4dC64a5
//https://holesky.etherscan.io/address/0xda377C69a11ec45A947086c6991aa343C4dC64a5#code

contract Euro {

    string public name = "Euro";
    string public symbol = unicode"€";
    uint256 public decimals = 18;
    uint256 public totalSupply = 1_000_000_000 * 10 ** 18;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) _allowances;

    constructor(){
        _balances[msg.sender]  = totalSupply;
    }

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    function balanceOf(address _owner) public view returns (uint256 balance){
        return _balances[_owner];
    }

    function transfer(address _to, uint256 _value) public returns (bool success){
        address from = msg.sender;
        require(balanceOf(from) >= _value,"Insufficient balance");

        _balances[from]-=_value;
        _balances[_to]+=_value;

        emit Transfer(from , _to , _value);

        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining){
        return _allowances[_owner][_spender];
    }

    function approve(address _spender, uint256 _value) public returns (bool success){
        address from = msg.sender;
        require(balanceOf(from) >= _value , "Insufficient balance");
        _allowances[from][_spender] = _value;

        emit Approval(from,_spender,_value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        require(balanceOf(_from) >=  _value , "Insufficient balance");
        require(allowance(_from, msg.sender) >= _value , "Denied Value");

        _balances[_from]-=_value;
        _allowances[_from][msg.sender]-=_value;
        _balances[_to]+=_value;

        emit Transfer(_from, _to, _value);

        return true;
        
    }


    

}