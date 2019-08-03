
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const ccpPath = './connection.json';
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath);



module.exports = {



    async enrollUser(req, res) {
       
        let header_data=req.headers;
        console.log(header_data);
        
        let orgName = header_data.orgname;
        let userName= header_data.username;
       

        
        if(orgName===undefined || userName===undefined || orgName.length==0 || userName.length==0) 
        {
            console.log("Aya");
            res.json({status:false,data:"",msg:"orgName and userName both are required!"});
            return;
        } 

        let orgMSP = ""; let ca_url = ""; let admin_identity_name ="";

        if (orgName.localeCompare("Manufacturer") == 0) {
            orgMSP = "ManufacturerMSP"; ca_url = "ca1.example.com" ; admin_identity_name = "Manufacturer_admin"
        }
        else if (orgName.localeCompare("Dealer") == 0) {
            orgMSP = "DealerMSP"; ca_url = "ca2.example.com";  admin_identity_name = "Dealer_admin"
        }
        else if (orgName.localeCompare("Insurance") == 0) {
            orgMSP = "InsuranceMSP"; ca_url = "ca3.example.com"; admin_identity_name = "Insurance_admin"
        }
        else if (orgName.localeCompare("Gdt") == 0) { 
            orgMSP = "GdtMSP"; ca_url = "ca4.example.com"; admin_identity_name = "Gdt_admin" 
        }
        else
        {
            console.log("Error orgname");
            res.json({stauts:false,data:"",msg:"orgName is not supplied or it is incorrect. Supported orgName are Manufacturer, Dealer, Insurance, Gdt"});
        }

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
         const gateway = new Gateway();
         await gateway.connect(ccp, { wallet, identity: admin_identity_name, discovery: { enabled: false } });

         const ca = gateway.getClient().getCertificateAuthority();
         const adminIdentity = gateway.getCurrentIdentity();
 
         try{
            const secret = await ca.register({ affiliation:'org1.department1', enrollmentID: userName, role: 'client' }, adminIdentity);
            const enrollment = await ca.enroll({ enrollmentID: userName, enrollmentSecret: secret });
            const userIdentity = X509WalletMixin.createIdentity(orgMSP, enrollment.certificate, enrollment.key.toBytes());
            console.log(userIdentity);
            console.log(typeof userIdentity);
            // add orgname and userName
            userIdentity.orgName = orgName;
            userIdentity.userName= userName;
            res.json({status:true,data:userIdentity});
         }
         catch(error){
             console.log(error);
             res.json({status:false,data:"",msg:error});
         }
         
    }

};