const query = require("../common/query.js");

module.exports = {
    async addVehicleNumber(ctx,vin,newNumber){

        const carAsBytes = await ctx.stub.getState(vin); // get the car from chaincode state
        let car = JSON.parse(carAsBytes.toString());
        car.number_plate = newNumber;
        car.requestForPlateNumber="fulfilled";
        await ctx.stub.putState(vin, Buffer.from(JSON.stringify(car)));
        let resultObj = {};
        resultObj.status = true;
        resultObj.data = {};
        resultObj.msg = "New Number is successfully assigned by the Gdt";
        return resultObj;
    },

    async rejectNewPlateNumberRequest(ctx,vin){

        const carAsBytes = await ctx.stub.getState(vin); // get the car from chaincode state
        let car = JSON.parse(carAsBytes.toString());
        car.number_plate = "";
        car.requestForPlateNumber="rejected";
        await ctx.stub.putState(vin, Buffer.from(JSON.stringify(car)));
        let resultObj = {};
        resultObj.status = true;
        resultObj.data = {};
        resultObj.msg = "New plate number is rejected by Gdt";
        console.log(resultObj);
        return resultObj;
    },

    async viewGdtRequest(ctx)
    {
     let queryString = {};
    queryString.selector = {
        "requestForPlateNumber":"requested"
      };
      let allResults = await query.runQuery(ctx,queryString);
         let returnObj = {}
         returnObj.status = "true";
         returnObj.data = allResults;
         
        return returnObj;
    },

   

}