
const query = require("../common/query.js");
module.exports={
    async addNewVehicle(ctx,vin, vehicleType, modal, companyName, color,owner)
    {
         let vehicle = {
            vin         :vin,
            vehicleType :vehicleType,
            modal       :modal,
            companyName :companyName,
            color       :color,
            owner       :owner

        }
        await ctx.stub.putState(vin,Buffer.from(JSON.stringify(vehicle)));
        let returnObj = {status:true,data:{},"msg":"Vehicle Added"};
        return returnObj; 
    },

    async queryAllVehicles(ctx)
    {
        let queryString = {};
        queryString.selector = {
            "_id": {
                "$gt": null
             }
          };
        let allResults = await query.runQuery(ctx,queryString);
        let resultObj = {};
        resultObj.status = "true"
         resultObj.data = allResults;
         resultObj.msg = "";
         console.log(allResults)
        return resultObj;
    },

    async querySpecificVehicle(ctx,vin)
    {
     let queryString = {};
    queryString.selector = {
        "vin":vin
      };
      let allResults = await query.runQuery(ctx,queryString);
         let returnObj = {}
         returnObj.status = "true";
         returnObj.data = allResults;
         
        return returnObj;
    },

    

    async ownerTrasfer(ctx,vin,newOwner)
    {
        const carAsBytes = await ctx.stub.getState(vin); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            let errorResult = {};
            errorResult.status=false;
            errorResult.data={};
            errorResult.msg = vin + " does not exsist!";
            return errorResult;
        }
        const car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;
        await ctx.stub.putState(vin, Buffer.from(JSON.stringify(car)));
        let resultObj = {};
        resultObj.status = true;
        resultObj.data = {};
        resultObj.msg = "Owner changed successfully!";
    }
}