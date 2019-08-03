
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = './connection.json';
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// Change the chaincode name from here
const chaincode_name = "fabcar";

module.exports = {

async get_contract(wallet_data)
{
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity:wallet_data.userName, discovery: { enabled: false } });

        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract('fabcar');
        return contract;
}
}
