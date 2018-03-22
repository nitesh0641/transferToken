pragma solidity ^0.4.17;

interface Token {
    function approve(address spender, uint256 value) public returns (bool);
    function transferFrom(address from, address to, uint256 value) public returns (bool);   
}


/**
 * The TransferCoin contract does this and that...
 */
contract TransferCoin {

    Token token = Token(0xB68c40b9770a97431F1a9630Df66F7f8f8596A87);

    function getContractAddr() view public returns (address) {
        return this;
    }

    function transfer(address _from, address _to, uint value) public payable {
        require(token.transferFrom(_from, _to, value));
    }
}
