const { Console } = require("console");

// solc compiler
solc = require("solc");

// file reader
fs = require("fs");

// Creation of Web3 class
Web3 = require("web3");

// Setting up a HttpProvider
web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

const EthereumTx = require("ethereumjs-tx").Transaction;
// Reading the file
file = fs.readFileSync("SimpleStorage.sol").toString();

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
var TokenN
var TokenT
var TokenS
var OwnerAddress
var SecAddress
var SendAmount
var AddressToCheck
var BalanceOfAcc

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.post('/SubmitToken', async (req, res) => {
  OwnerAddress = req.body.dropdown;
  TokenN = req.body.TokenName;
  TokenT = req.body.TokenTag;
  TokenS = req.body.TotalSupply;
  console.log(OwnerAddress);
  SolFunctions()
});
app.post('/SendToken', async (req, res) => {
  SecAddress = req.body.dropdown1;
  SendAmount = req.body.TokenAmount;
  console.log(SecAddress,SendAmount)
});
app.post('/BalanceCheck', async (req, res) => {
    AddressToCheck=req.body.dropdown3;
    console.log(AddressToCheck)
});
app.get('/CheckBalance', async (req, res) => {
  await CheckFunction()
  res.json({ BalanceAmount: `This account's balance : ${BalanceOfAcc}` });
});
app.get("/options", (req, res) => {
  web3.eth.getAccounts().then((accounts) => {res.send(accounts) })
  
});

app.get('/CreateAToken', (req, res) => {
  res.json({ TokName: `Token name : ${TokenN}`,TokTag: `Token tag : ${TokenT}`,TokSupply: `Token current supply : ${TokenS}` });
});

app.get('/SendTokens', async (req, res) => {
  await SendFunction()
});
app.get('/Mint', async (req, res) => {
  await MintFunction()
  res.json({ TokSupply: `Token current supply : ${TokenS}` });
});
app.get('/Burn', async (req, res) => {
  await BurnFunction()
  res.json({ TokSupply: `Token current supply : ${TokenS}` });
  
});
// Input structure for solidity compiler
var input = {
  language: "Solidity",
  sources: {
    "SimpleStorage.sol": {
      content: file,
    },
  },

  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));

ABI = output.contracts["SimpleStorage.sol"]["SimpleStorage"].abi;
bytecode =
  output.contracts["SimpleStorage.sol"]["SimpleStorage"].evm.bytecode.object;
const SimpleStorage = new web3.eth.Contract(ABI, null, {
  data: bytecode,
});

web3.eth.getAccounts().then((accounts) => {
  // Display all Ganache Accounts
  console.log("Accounts:", accounts);

  mainAccount = accounts[0];

  // address that will deploy smart contract
  console.log("Default Account:", mainAccount);
});


var ContractInstance
var TotalSupplyNumber;
async function SetupInitialContract() 
{
  const myAddress = OwnerAddress;
  const constructorParams = [TokenN, TokenT, TokenS];
  await SimpleStorage.deploy({
    data: bytecode,
    arguments: constructorParams,
  })
    .send({
      from: myAddress,
      gas: "1000000",
      gasPrice: "1000000000",
    })
    .then((newContractInstance) => {
      ContractInstance = newContractInstance
      console.log(
        `Contract deployed at address: ${newContractInstance.options.address}`
      );
      
    });
   
}
async function SolFunctions(){
  await SetupInitialContract()

}

async function MintFunction(){
  await ContractInstance.methods
        .mint(100)
        .send({
          from: OwnerAddress,
          gas: "1000000",
          gasPrice: "1000000000",
        })
        .then(() => {
          console.log("Mint transaction successful");
        });
  await ContractInstance.methods.totalSupply().call().then(function(result){TokenS= result})
}
async function BurnFunction(){
  await ContractInstance.methods
        .burn(100)
        .send({
          from: OwnerAddress,
          gas: "1000000",
          gasPrice: "1000000000",
        })
        .then(() => {
          console.log("Burn transaction successful");
        });
  await ContractInstance.methods.totalSupply().call().then(function(result){TokenS= result})
}
async function SendFunction(){
  await ContractInstance.methods
        .transfer(SecAddress,SendAmount)
        .send({
          from: OwnerAddress,
          gas: "1000000",
          gasPrice: "1000000",
        })
        .then(() => {
          console.log("Transfer succesful");
        });
  await ContractInstance.methods.totalSupply().call().then(function(result){TokenS= result})
}
async function CheckFunction(){
  await ContractInstance.methods.checkBalanceOf(AddressToCheck).call().then(function(result){BalanceOfAcc = result});
  await ContractInstance.methods.totalSupply().call().then(function(result){TokenS= result})
}