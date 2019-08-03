const ClientIdentity = require('fabric-shim').ClientIdentity;
module.exports={
   async checkUser(ctx,client_accepted_department){
    let cid = new ClientIdentity(ctx.stub);
    let user_attrs = cid.attrs;
    user_attrs = user_attrs["hf.Affiliation"];
    console.log(user_attrs + " " + client_accepted_department)
    if(user_attrs.localeCompare(client_accepted_department)==0)
    {
      console.log("return 1");
       return 1;
       
    }
    else
    {
      console.log("return 0");
       return 0;
       
    }
    
   }
}


  
