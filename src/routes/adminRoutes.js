const router = require('express').Router();
const RatePolicy = require('../models/RatePolicy');

router.post('/policy',async(req,res)=>{
  const {tier,endpoint,maxRequests,windowSize}=req.body;
  
  const p = await RatePolicy.findOneAndUpdate(
    {tier,endpoint},
    {maxRequests,windowSize},
    {new:true,upsert:true}
  );

  res.json(p);
});

router.get('/policies',async(req,res)=>{
  res.json(await RatePolicy.find());
});

module.exports = router;