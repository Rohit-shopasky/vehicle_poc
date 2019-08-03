

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const rimraf = require("rimraf");
const ccpPath = './connection.json';
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);


module.exports = {
    async store_wallet(req){
        
        let header_data=req.headers;
        console.log("Aya");
        console.log(header_data);
       

        header_data.certificate = header_data.certificate.replace(/\\n/g,"\n");
        header_data.certificate = header_data.certificate.replace(/\\r/g,"\r");
        header_data.privatekey = header_data.privatekey.replace(/\\n/g,"\n");
        header_data.privatekey = header_data.privatekey.replace(/\\r/g,"\r");
        //console.log("header_data");
        
        let wallet_data = {};
        wallet_data.type = header_data.type;
        wallet_data.mspId= header_data.mspid;
        wallet_data.certificate = header_data.certificate;
        wallet_data.privateKey = header_data.privatekey;
        wallet_data.orgName = header_data.orgname;
        wallet_data.userName = header_data.username;

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
  
         // delete wallet if exisit
         
         await module.exports.remove_wallet(wallet_data.userName);
        try{
       await wallet.import(wallet_data.userName,wallet_data);
        }
        catch(error) {console.log("Error in user certificates or private key"); return -1;}
        console.log("wallet imported");
       return wallet_data; 
    },

    async remove_wallet(directory_name)
    {
        rimraf.sync("./wallet/" +directory_name);
        return 1;
    }
}