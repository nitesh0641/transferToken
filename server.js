var express = require('express');
var Web3 = require('web3');
var app = express();
var bodyParser = require('body-parser');
var tokens = require('./tools');
var admin = require('./admin');

//-- ERC20 token contract generic abi
var contractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"inputs":[{"name":"_initialAmount","type":"uint256"},{"name":"_tokenName","type":"string"},{"name":"_decimalUnits","type":"uint8"},{"name":"_tokenSymbol","type":"string"}],"payable":false,"type":"constructor"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"}];
var contractAddress = '0xB68c40b9770a97431F1a9630Df66F7f8f8596A87'; // DLPT ropsten address
var secondAddress = '0xdf1bf302ab5a97a8c4435d2061c41b43a8a30a42'; // User 1 ropsten address

//-- my smart contract abi
var transferContractABI = [{"constant":true,"inputs":[],"name":"getContractAddr","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}];
var byteCode = '0x606060405273b68c40b9770a97431f1a9630df66f7f8f8596a876000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550341561006357600080fd5b61024e806100726000396000f30060606040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680639e45593914610051578063beabacc8146100a6575b600080fd5b341561005c57600080fd5b6100646100fc565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6100fa600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610104565b005b600030905090565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd8484846040518463ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019350505050602060405180830381600087803b15156101fb57600080fd5b5af1151561020857600080fd5b50505060405180519050151561021d57600080fd5b5050505600a165627a7a7230582015c6d9adddf04ced6764dd590149ec7248b0ae9f8e97d4afd30a55c498445a230029';
var transferContractAddress = '0x2d0a862cb09ab8d0585b82f505a399d91d074f93';

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
var port = process.env.PORT || 8000;
var router = express.Router();

// -- initialise web3 -- //
if(typeof web3 !== "undefined" && typeof web3.currentProvider !== "undefined") {
    var web3 = new Web3(web3.currentProvider);
} else {
	// set the provider you want from Web3.providers
	// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
	console.log('No web3? You should consider trying MetaMask!')
	web3 = new Web3(new Web3.providers.HttpProvider("http://136.243.38.66:8545"));
	web3.personal.unlockAccount(web3.eth.accounts[0], 'Default@123', 15000)
}
var addr = web3.eth.accounts[0];
var web3Message = '';

app.use('/api',router);

router.get('/', function(req, res){
	res.json({message: 'Welcome to our Test API'});
});

// var balOf = function (req, res) {
//   console.log('LOGGED')
//   next()
// }

// -- admin part -- //
router.post('/newAccount', function(req, res){
	password = req.body.newPass;
	var web3Message = admin.accountOpen(web3, password);

	res.json({wallet_id: web3Message});
});

router.post('/sendFund', function(req, res) {
	from = req.body.from;
	to = req.body.to;
	unit = req.body.unit;
	web3Message = admin.transfer(web3, from, to, unit);

	res.json({transactionHash: web3Message});
});

// -- token part -- //
router.get('/dlpt', function(req, res){
	//-- dealing with tokens--//
	var dlptToken = web3.eth.contract(contractABI).at(contractAddress);
	var web3Message = "Coinname is => "+tokens.tName(dlptToken);
	web3Message += " Token balance of "+addr+" is "+tokens.tBalance(dlptToken, addr);

	res.json({message: web3Message});
});

router.post('/approveAccount', function(req, res){
	//-- dealing with tokens--//
	var dlptToken = web3.eth.contract(contractABI).at(contractAddress);
	
	accOwner = req.body.accId;
	accPass = req.body.accPass;
	coinUnit = req.body.unit;
	web3.personal.unlockAccount(accOwner, accPass, 15000);
	web3Message = tokens.tApproveAcc(dlptToken, accOwner, transferContractAddress, coinUnit);

	res.json({message: web3Message});
});

router.post('/coinAPI', function(req, res){
	//--dealing with my contract--//
	var trxcoin = web3.eth.contract(transferContractABI).at(transferContractAddress);
	// var web3Message = "Contract address is => "+tokens.cAddress(trxcoin);

	var fromAddr = req.body.from,
		toAddr = req.body.to,
		mainAddr = addr,
		coinUnit = req.body.unit;
	// web3Message = " post data => "+fromAddr+", "+toAddr+", "+coinUnit;
	// web3Message = req.body;
	// console.log(req.body);
	web3Message = tokens.cTransfer(trxcoin, mainAddr, fromAddr, toAddr, coinUnit);

	res.json({"transactionHash": web3Message});
});

app.listen(port);

console.log('Server Listening on port '+port);

