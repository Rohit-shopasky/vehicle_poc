const { FileSystemWallet, Gateway } = require('fabric-network')
const fs = require('fs')
const path = require('path')

const ccpPath = './connection.json'
const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
const ccp = JSON.parse(ccpJSON)
const connection = require('./common/connect.js')

module.exports = {
  
    async request_for_plate_number(req,res,wallet_data)
    {
       
        let {vin} = req.body;
        let contract = await connection.get_contract(wallet_data);
        let result = await contract.submitTransaction('requestGdtForNewNumber',vin);
       console.log(result);
        res.json({status:true,data:"",msg:"Plate number requested from Gdt"});
        
    },

    async request_for_policy_number(req,res,wallet_data)   
    {
        let {vin} = req.body;
        let contract = await connection.get_contract(wallet_data);
        let result = await contract.submitTransaction('requestInsuranceForNewNumber',vin);
        console.log(result);
        result = JSON.parse(result);
        res.json({status:true,data:"",msg:"Policy number requested from Insurance"});
    },

   

}