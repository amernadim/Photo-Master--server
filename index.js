const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()

const port = process.env.PORT || 5000 ;

// middle wares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p2qoups.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try{
  const serviceCollection = client.db('photoMaster').collection('services');

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

  // create 
  app.post('/allServices' ,async(req,res) => {
    const service = req.body;
    const result = await serviceCollection.insertOne(service);
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