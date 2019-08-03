const query = require("../common/query.js");

module.exports = {
    async addVehiclePolicy(ctx,vin,newNumber){

        const carAsBytes = await ctx.stub.getState(vin); // get the car from chaincode state
        let car = JSON.parse(carAsBytes.toString());
        car.policy_number = newNumber;
        car.requestForPolicyNumber="fulfilled";
        await ctx.stub.putState(vin, Buffer.from(JSON.stringify(car)));
        let resultObj = {};
        resultObj.status = true;
        resultObj.data = {};
        resultObj.msg = "New Number is successfully assigned by the Insurance Company";
        return resultObj;
    },

    async rejectNewPolicyRequest(ctx,vin){

        const carAsBytes = await ctx.stub.getState(vin); // get the car from chaincode state
        let car = JSON.parse(carAsBytes.toString());
        car.policy_number = "";
        car.requestForPolicyNumber="rejected";
        await ctx.stub.putState(vin, Buffer.from(JSON.stringify(car)));
        let resultObj = {};
        resultObj.status = true;
        resultObj.data = {};
        resultObj.msg = "Number is successfully Deleted by the Insurance";
        console.log("Return obj from function");
        console.log(resultObj);
        return resultObj;
    },

    async viewInsuranceRequest(ctx)
    {
     let queryString = {};
    queryString.selector = {
        "requestForPolicyNumber":"requested"
      };
      let allResults = await query.runQuery(ctx,queryString);
         let returnObj = {}
         returnObj.status = "true";
         returnObj.data = allResults;
         
        return returnObj;
    },

   

}