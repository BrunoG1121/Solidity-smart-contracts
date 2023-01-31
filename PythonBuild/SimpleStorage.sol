// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

contract SimpleStorage {
    address public owner;
    string public name;
    string public symbol;
    uint256 public totalSupply;
    mapping (address => uint256) public balanceOf;

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) public {
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply;
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public {
        require(balanceOf[msg.sender] >= _value, "Not enough balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
    }

    function checkBalanceOf(address _owner) public view returns (uint256) {
        return balanceOf[_owner];
    }

    function mint(uint256 _value) public {
        require(msg.sender == owner, "Only owner can mint");
        totalSupply += _value;
        balanceOf[msg.sender] += _value;
    }

    function burn(uint256 _value) public {
        require(msg.sender == owner, "Only owner can burn");
        require(balanceOf[msg.sender] >= _value, "Not enough balance");
        totalSupply -= _value;
        balanceOf[msg.sender] -= _value;
    }
}
