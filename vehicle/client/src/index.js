"use strict";

const user = require("./user.js");
const manufacturer = require("./manufacturer.js");
const gdt = require("./gdt.js");
const insurance = require("./insurance.js");
const dealer = require("./dealer.js")
const wallet_store = require("./common/create_wallet.js");

module.exports = function(app) {



app.post("/enroll_user",async (req,res)=>{
    user.enrollUser(req,res);
})

app.post("/add_vehicle",async(req,res)=>{
    console.log("Add vehicle called!");
   let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }
    manufacturer.addVehicle(req,res,wallet_data);
});

app.get("/query_all_vehicles",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }
   manufacturer.queryAllVehicles(req,res,wallet_data);
})

app.post("/query_sepecific_vehicle",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }
      manufacturer.querySpecificVehicle(req,res,wallet_data);
});

app.post("/owner_transfer",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }
   manufacturer.owner_transfer(req,res,wallet_data)
})

app.post("/add_vehicle_number",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }

   gdt.addVehicleNumber(req,res,wallet_data);

})

app.post("/add_vehicle_policy",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }

   insurance.addVehiclePolicy(req,res,wallet_data);
});

app.get("/get_vehicle_history",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }

   manufacturer.traveseHistory(req,res,wallet_data);
})


app.post("/request_for_plate_number",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }
   console.log("Request for plate number called");
     dealer.request_for_plate_number(req,res,wallet_data);
})


app.post("/request_for_policy_number",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }
   dealer.request_for_policy_number(req,res,wallet_data);
})



app.post("/reject_policy_number",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }
   insurance.rejectNewPolicyRequest(req,res,wallet_data);
})

app.post("/reject_plate_number",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }
   gdt.rejectNewPlateNumberRequest(req,res,wallet_data);
});


app.get("/get_all_plate_requests",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }
   gdt.viewAllGdtRequests(req,res,wallet_data);
});


app.get("/get_all_policy_requests",async(req,res)=>{
    let wallet_data = await wallet_store.store_wallet(req);
   if(wallet_data==-1)
   {
       res.json({status:"false","data":"",msg:"Error in user certificates or private key"})
       return;
   }
   insurance.viewInsuranceRequest(req,res,wallet_data);
});



}






