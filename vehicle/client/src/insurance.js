const { FileSystemWallet, Gateway } = require('fabric-network')
const fs = require('fs')
const path = require('path')

const ccpPath = './connection.json'
const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
const ccp = JSON.parse(ccpJSON)
const connection = require('./common/connect.js')


module.exports = {
    async addVehiclePolicy(req,res,wallet_data)
    {
        let {vin,NewNumber} = req.body;
        console.log(req.body);
        let contract = await connection.get_contract(wallet_data);
        try{
        let result = await contract.submitTransaction('addVehiclePolicy',vin,NewNumber);
        console.log(result);
        res.json({status:true,data:"",msg:"Vehicle number updated successfully!"});
        }
        catch(error)
        {
            console.log(error);
            res.json({status:false,data:"",msg:"Something went wrong!"});
        }
    },

    async rejectNewPolicyRequest(req,res,wallet_data)
    {
        let {vin} = req.body;
        let contract = await connection.get_contract(wallet_data);
        let result = await contract.submitTransaction('rejectNewPolicyRequest',vin);
        result = JSON.parse(result);
        res.json({status:true,data:"",msg:"Policy number rejected by Insurance company."});
    },

    async viewInsuranceRequest(req,res,wallet_data)
    {
        let contract = await connection.get_contract(wallet_data);
        let result = await contract.evaluateTransaction('viewInsuranceRequest');
        result = JSON.parse(result);
        console.log(result);
        res.send(result);
       
    }
}