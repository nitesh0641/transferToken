var express = require('express');
var Web3 = require('web3');
var app = express();
var bodyParser = require('body-parser');
var tokens = require('./tools');

var contractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"inputs":[{"name":"_initialAmount","type":"uint256"},{"name":"_tokenName","type":"string"},{"name":"_decimalUnits","type":"uint8"},{"name":"_tokenSymbol","type":"string"}],"payable":false,"type":"constructor"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"}];
var contractAddress = '0xB68c40b9770a97431F1a9630Df66F7f8f8596A87'; // DLPT ropsten address
var secondAddress = '0xdf1bf302ab5a97a8c4435d2061c41b43a8a30a42'; // User 1 ropsten address


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8000;


var router = express.Router();

app.use('/api',router);

router.get('/', function(req, res){
	res.json({message: 'Welcome to our Test API'});
});

// var balOf = function (req, res) {
//   console.log('LOGGED')
//   next()
// }



router.get('/web3', function(req, res){
	if(typeof web3 !== "undefined" && typeof web3.currentProvider !== "undefined") {
        var web3 = new Web3(web3.currentProvider);
	} else {
		// set the provider you want from Web3.providers
		// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
		console.log('No web3? You should consider trying MetaMask!')
		web3 = new Web3(new Web3.providers.HttpProvider("http://136.243.38.66:8545"));
	}
	addr = web3.eth.accounts[0];
	// var web3Message = "Coinbase is => "+addr;

	var token = web3.eth.contract(contractABI).at(contractAddress);
	var web3Message = "Coinname is => "+tokens.tName(token);
	web3Message += "\n Token balance of "+addr+" is "+tokens.tBalance(token, addr);

	res.json({message: web3Message});
});

app.listen(port);

console.log('Server Listening on port '+port);

