from solcx import compile_standard, install_solc

# install_solc("0.6.0")

import json
from web3 import Web3

# Read the contents of the SimpleStorage.sol contract file
with open("./SimpleStorage.sol", "r") as file:
    simple_storage_file = file.read()

# Compile the Solidity contract using the solcx package
compiled_sol = compile_standard(
    {
        "language": "Solidity",
        "sources": {"SimpleStorage.sol": {"content": simple_storage_file}},
        "settings": {
            "outputSelection": {
                "*": {"*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]}
            }
        },
    },
    solc_version="0.6.0",
)

# Save the compiled contract's bytecode and ABI to a local file
with open("compiled_code.json", "w") as file:
    json.dump(compiled_sol, file)

# Extract the bytecode and ABI from the compiled contract
# bytecode
bytecode = compiled_sol["contracts"]["SimpleStorage.sol"]["SimpleStorage"]["evm"][
    "bytecode"
]["object"]

# abi
abi = compiled_sol["contracts"]["SimpleStorage.sol"]["SimpleStorage"]["abi"]
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
chain_id = 1337
my_addres = "0x0056941d2d8e96Ff0c586c7AF2f8becc2f7c212a"
private_key = "0x5def8119611261a8358c475f0d84c2f5c364954805cff7de8c95d766c08e83bd"

# Create the contract in python
SimpleStorage = w3.eth.contract(abi=abi, bytecode=bytecode)

# Get the nonce
nonce = w3.eth.getTransactionCount(my_addres)

# Build a transaction

name = "BrunoLorenzoToken"
symbol = "BLT"
total_supply = 1000000

transaction = SimpleStorage.constructor(name, symbol, total_supply).buildTransaction(
    {"chainId": chain_id, "from": my_addres, "nonce": nonce}
)
# Sign a transaction
signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)

# Send the signed transaction
tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

contract_address = tx_receipt['contractAddress']
SimpleStorage2 = w3.eth.contract(address = contract_address, abi=abi)
###---Parametars----

mint_amount = 10
burn_amount = 500
Druga_adresa ="0x48B19a1EEA50Ee5D0bd782bd3CaC0617822E3679"
BrojPoslanihTokena = 500

###----------------
# Pregled pocetnog stanja
print("----Pregled pocetnog stanja----")
print("Initial total supply:", SimpleStorage2.functions.totalSupply().call())
balance2 = SimpleStorage2.functions.checkBalanceOf(my_addres).call()
print("Stanje našeg računa(owner):", balance2)
balance = SimpleStorage2.functions.checkBalanceOf(Druga_adresa).call()
print("Stanje drugog računa:", balance)
print("----------------------------")
#Mintanje novih tokena


SimpleStorage2.functions.mint(mint_amount).transact({'from': my_addres})

print("Total supply nakon mintanja:", SimpleStorage2.functions.totalSupply().call())


# Burnanje tokena
SimpleStorage2.functions.burn(burn_amount).transact({'from': my_addres})

print("Total supply nakon burnanja:", SimpleStorage2.functions.totalSupply().call())


#Slanje s našeg računa na drugi
print("---Slanje tokena s jednog računa na drugi---")
balance2 = SimpleStorage2.functions.checkBalanceOf(my_addres).call()
print("Stanje našeg računa:", balance2)
balance = SimpleStorage2.functions.checkBalanceOf(Druga_adresa).call()
print("Stanje drugog računa:", balance)

SimpleStorage2.functions.transfer(Druga_adresa,BrojPoslanihTokena).transact({'from': my_addres})
print("Transfered")

balance2 = SimpleStorage2.functions.checkBalanceOf(my_addres).call()
print("Stanje našeg računa:", balance2)
balance = SimpleStorage2.functions.checkBalanceOf(Druga_adresa).call()
print("Stanje drugog računa:", balance)
print("------------------------------------------")



balance = w3.eth.getBalance(my_addres)

# Convert the balance from wei to ether
balance_ether = w3.fromWei(balance, 'ether')

# Print the balance in ether
print("Stanje ETH nakon odrađenih transakcija", my_addres, "je", balance_ether, "ether")