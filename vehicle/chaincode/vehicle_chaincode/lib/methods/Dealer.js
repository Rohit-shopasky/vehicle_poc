const query = require("../common/query.js");

module.exports = {
    async requestGdtForNewNumber(ctx,vin)
    {
        const vehicleAsBytes = await ctx.stub.getState(vin);
        let vehicle = JSON.parse(vehicleAsBytes.toString());
        vehicle.requestForPlateNumber="requested";
        await ctx.stub.putState(vin, Buffer.from(JSON.stringify(vehicle)));
        let resultObj = {};
        resultObj.status = true;
        resultObj.data = {};
        resultObj.msg = "Requested Plate Number from Gdt !";
        return resultObj;
    },

    async requestInsuranceForNewNumber(ctx,vin)
    {
        const vehicleAsBytes = await ctx.stub.getState(vin);
        let vehicle = JSON.parse(vehicleAsBytes.toString());
        vehicle.requestForPolicyNumber="requested";
        await ctx.stub.putState(vin, Buffer.from(JSON.stringify(vehicle)));
        let resultObj = {};
        resultObj.status = true;
        resultObj.data = {};
        resultObj.msg = "Requested new policy number from Insurance company !";
        return resultObj;
    }

}