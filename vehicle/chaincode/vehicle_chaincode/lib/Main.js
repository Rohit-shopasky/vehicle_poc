'use strict';
const { Contract } = require('fabric-contract-api');
const user = require("./common/user.js");
const Manufacturer  = require("./methods/Manufacturer.js");
const Gdt = require("./methods/Gdt.js");
const Insurance = require("./methods/Insurance.js");
const Dealer = require("./methods/Dealer.js");
const query = require("./common/query.js");

let errorResult = {"status":false,msg:"Un Authorize access","data":{}};
let exsistError = {"status":false,"msg":"Vehicle does not exsist","data":{}};

class Main extends Contract {

    async addNewVehicle(ctx,vin, vehicleType, modal, companyName, color,owner)
    {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            let result = await Manufacturer.addNewVehicle(ctx,vin,vehicleType,modal,companyName,color,owner);
            return result;
        }
        else
        {
           return errorResult;
        }
    }

    async queryCompanyVehicles(ctx,vin)
    {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            let result = await Manufacturer.querySpecificVehicle(ctx,vin);
            return result;
        }
        else
        {
           return errorResult;
        }
    }

    async queryVehicle(ctx)
    {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            let result = await Manufacturer.queryAllVehicles(ctx);
            return result;
        }
        else
        {
           return errorResult;
        }
    }

    async ownerTrasfer(ctx, vin, newOwner) {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            let result = await Manufacturer.ownerTrasfer(ctx,vin,newOwner);
            return result;
        }
        else
        {
           return errorResult;
        }

    }

    // Gdt started
    async addVehicleNumber(ctx,vin,NewNumber)
    {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            // check if vehicle exists in or not
            let vehicle = await Manufacturer.querySpecificVehicle(ctx,vin);
            console.log("Going to print vehicle");
            vehicle = Object.values(vehicle);
            if(vehicle[1].length==0)
              {
                  return exsistError;
              }
            else
            {
                let result = await Gdt.addVehicleNumber(ctx,vin,NewNumber);
                return result;
            }
        }
        else
        {
           return errorResult;
        }
    }

    async rejectNewPlateNumberRequest(ctx,vin)
    {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            // check if vehicle exists in or not
            let vehicle = await Manufacturer.querySpecificVehicle(ctx,vin);
            console.log("Going to print vehicle");
            vehicle = Object.values(vehicle);
            if(vehicle[1].length==0)
              {
                  return exsistError;
              }
            else
            {
                let result = await Gdt.rejectNewPlateNumberRequest(ctx,vin);
                console.log(result);
                return result;
            }
        }
        else
        {
           return errorResult;
        }
    }

    async viewGdtRequest(ctx)
    {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            let result = await Gdt.viewGdtRequest(ctx);
            return result;
        }
        else
        {
           return errorResult;
        }
    }


    // Insurance Started

    async addVehiclePolicy(ctx,vin,NewNumber)
    {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            // check if vehicle exists in or not
            let vehicle = await Manufacturer.querySpecificVehicle(ctx,vin);
            console.log("Going to print vehicle");
            vehicle = Object.values(vehicle);
            if(vehicle[1].length==0)
              {
                  return exsistError;
              }
            else
            {
                let result = await Insurance.addVehiclePolicy(ctx,vin,NewNumber);
                return result;
            }
        }
        else
        {
           return errorResult;
        }
    }

    async rejectNewPolicyRequest(ctx,vin)
    {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            // check if vehicle exists in or not
            let vehicle = await Manufacturer.querySpecificVehicle(ctx,vin);
            console.log("Going to print vehicle");
            vehicle = Object.values(vehicle);
            if(vehicle[1].length==0)
              {
                  return exsistError;
              }
            else
            {
                let result = await Insurance.rejectNewPolicyRequest(ctx,vin);
                console.log(result);
                return result;
            }
        }
        else
        {
           return errorResult;
        }
    }

    async viewInsuranceRequest(ctx)
    {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            let result = await Insurance.viewInsuranceRequest(ctx);
            return result;
        }
        else
        {
           return errorResult;
        }
    }
     
    async traverseHistory(ctx,vin)
    {
       let result = await query.traverseHistory(ctx,vin);
       return result;
    }


    // Dealer starts 

    async requestGdtForNewNumber(ctx,vin)
    {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            // check if vehicle exists in or not
            let vehicle = await Manufacturer.querySpecificVehicle(ctx,vin);
            console.log("Going to print vehicle");
            vehicle = Object.values(vehicle);
            if(vehicle[1].length==0)
              {
                  return exsistError;
              }
            else
            {
                let result = await Dealer.requestGdtForNewNumber(ctx,vin);
                return result;
            }
        }
        else
        {
           return errorResult;
        }
    }

    
    async requestInsuranceForNewNumber(ctx,vin)
    {
        let client_accepted_department="org1.department1";
        let verify_user = await user.checkUser(ctx,client_accepted_department);
        if(verify_user==1)
        {
            // check if vehicle exists in or not
            let vehicle = await Manufacturer.querySpecificVehicle(ctx,vin);
            console.log("Going to print vehicle");
            vehicle = Object.values(vehicle);
            if(vehicle[1].length==0)
              {
                  return exsistError;
              }
            else
            {
                let result = await Dealer.requestInsuranceForNewNumber(ctx,vin);
                return result;
            }
        }
        else
        {
           return errorResult;
        }
    }


    
    

}

module.exports = Main;
