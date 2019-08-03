const { FileSystemWallet, Gateway } = require('fabric-network')
const fs = require('fs')
const path = require('path')

const ccpPath = './connection.json'
const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
const ccp = JSON.parse(ccpJSON)
const connection = require('./common/connect.js')

module.exports = {
  async addVehicle (req, res, wallet_data) {
    try {
      let { vin, vehicle_type, company_name, model_name, color } = req.body
      let contract = await connection.get_contract(wallet_data)
      let result = await contract.submitTransaction(
        'addNewVehicle',
        vin,
        vehicle_type,
        model_name,
        company_name,
        color,
        'Manufacturer'
      )
      console.log('Transaction has been submitted ' + result)
      // await remove_wallet(wallet_data.userName);
      res.json({ status: true, data: '', msg: 'Vehicle Added' })
    } catch (error) {
      console.log('error in user identity')
      res.json({ status: false, data: '', msg: error })
    }
  },

  async queryAllVehicles (req, res, wallet_data) {
    let contract = await connection.get_contract(wallet_data);
    let result = await contract.evaluateTransaction('queryVehicle');
    result = JSON.parse(result);
    console.log(result);
    res.send(result);
  },

  async querySpecificVehicle(req,res,wallet_data)
  {
    let {vin} = req.body;
    let contract = await connection.get_contract(wallet_data);
    let result = await contract.evaluateTransaction('queryCompanyVehicles',vin);
    result = JSON.parse(result);
    res.send(result);
  },

  async owner_transfer(req,res,wallet_data)
  {
    let {vin,newOwner} = req.body;
    let contract = await connection.get_contract(wallet_data);
    let result = await contract.submitTransaction('ownerTrasfer',vin,newOwner);
    console.log(result);
    res.json({status:true,data:"",msg:"Owner changed successfully!"});
  },

  async traveseHistory(req,res,wallet_data)
  {
    let {vin} = req.query;
    let contract = await connection.get_contract(wallet_data);
    let result = await contract.evaluateTransaction('traverseHistory',vin);
    result = JSON.parse(result);
    res.send(result);

  }

   

}
