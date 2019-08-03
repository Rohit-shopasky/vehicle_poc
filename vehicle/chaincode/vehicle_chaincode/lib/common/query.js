module.exports ={

    async runQuery(ctx,queryString)
    {
      let iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
      let allResults = [];
  
       while(true)
       {
          let res = await iterator.next();
          let jsonRes = {};
          
          if(res.value && res.value.value.toString())
          {
          let value=res.value.value.toString('utf8');
          jsonRes.Key = res.value.key;
          jsonRes.value = value;
          allResults.push(jsonRes);
          }
          
          if(res.done)
          break; // break the loop
       }
       return allResults;
    },
    
    async traverseHistory(ctx,vin)
    {
       let iterator = await ctx.stub.getHistoryForKey(vin);
       let allResults = [];
  
       while(true)
       {
          let res = await iterator.next();
          let jsonRes = {};
          
          if(res.value && res.value.value.toString())
          {
          let value=res.value.value.toString('utf8');
          
          jsonRes.Key = res.value.key;
          jsonRes.value = value;
          jsonRes.time = res.value.timestamp;
          jsonRes.txid = res.value.tx_id;
          allResults.push(jsonRes);
          }
          
          if(res.done)
          break; // break the loop
       }
       return allResults;
    }
  
  }
