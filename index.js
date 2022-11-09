const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
// jwt
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()

const port = process.env.PORT || 5000 ;

// middle wares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p2qoups.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// jwt function
function verifyJWT (req,res,next) {
  // console.log(req.headers.authorization)
  const authHeader = req.headers.authorization;
  if(!authHeader) {
    return res.status(401).send({message : 'unauthorize access'})
  } 
  const token = authHeader.split(' ')[1] ;
  jwt.verify(token,process.env.ACCESS_TOKEN,function(err,decoded){
    if(err)  {
      return res.status(401).send({message : 'unauthorize access'})
    }
    req.decoded = decoded;
    next()
  })
}

async function run() {
  try{
  const serviceCollection = client.db('photoMaster').collection('services');
  const reviewCollection = client.db('photoMaster').collection('reviews');

   // jwt 
   app.post('/jwt' , (req,res) => {
    const user = req.body ;
    const token = jwt.sign(user,process.env.ACCESS_TOKEN,{
      expiresIn : '1d'
    })
    res.send({token})
  })

  // get all service
  app.get('/allServices' , async(req,res) => {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send(services)
  })

  //get 3 services
  app.get('/limitServices' , async(req,res) => {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.limit(3).toArray();
    res.send(services)
  })

  // get single service
  app.get("/service/:id" ,async(req,res)=> {
    const id = req.params.id;
    const query = {_id : ObjectId(id)};
    const service = await serviceCollection.findOne(query);
    res.send(service)
  })

  // create services 
  app.post('/allServices' ,async(req,res) => {
    const service = req.body;
    const result = await serviceCollection.insertOne(service);
    res.send(result)
  })

  // create review
  app.post('/allreviews', async(req,res) => {
    const review = req.body;
    const myDate = new Date();
    const result = await reviewCollection.insertOne({review, myDate});
    res.send(result)
  })

  //get all review 
  app.get('/allreviews' , async(req,res) => {
    const query = {};
    const cursor = reviewCollection.find(query);
    const reviews = await cursor.toArray();
    res.send(reviews)
  })

  // get reviews by service id
  app.get('/reviews/:serviceId' , async(req,res) => {
    const id = req.params.serviceId;    
    const cursor = reviewCollection.find({"review.serviceId" : id}).sort({"myDate" : -1});
    const reviews = await cursor.toArray();
    res.send(reviews)
  })

  // get one by id
  app.get('/review/:id', async(req,res)=> {
    const id = req.params.id;
    const query = {_id : ObjectId(id)};
    const user = await reviewCollection.findOne(query);
    res.send(user)
  })

  // get reviews by email
  app.get('/reviewes/:email' , verifyJWT,  async(req,res) => {
    const email = req.params.email; 
    
    const decoded = req.decoded ;
    if(decoded.email !== email) {
      return res.status(403).send({message : 'Forbidded access'})
    }
    
    const cursor = reviewCollection.find({"review.reviewerEmail" : email }).sort({"myDate" : -1});
    const reviews = await cursor.toArray();
    res.send(reviews)
  })

    // delete one reviews
    app.delete('/reviews/:id' , async(req,res)=> {
      const id = req.params.id ;
      const query = {_id : ObjectId(id)};
      const result = await reviewCollection.deleteOne(query);
      res.send(result)
    })

   // update one
  app.put('/reviews/:id' , async(req,res)=> {
    const id = req.params.id ;
    const user = req.body;  
    const query = {_id : ObjectId(id)};
    const result = await reviewCollection.updateOne(query,{
      $set:{"review.reviewText" : user.reviewText}
    });
    res.send(result)
  })
 
  }
  finally{

  }
  
}
run().catch(err => console.error(err))

app.get('/' , (req,res) => {
  res.send('Photo Master Running')
})

app.listen(port , () => {
  console.log(`server runnig on port ${port}`);
})