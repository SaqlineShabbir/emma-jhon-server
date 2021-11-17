const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mieka.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run () {
    try{
      
        await client.connect()
        console.log('db connected')
        const database = client.db('online_Shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders')

       //get products API 
       app.get('/products', async(req, res) =>{
           const cursor = productCollection.find({});
           const page = req.query.page;
           const size = parseInt(req.query.size);
           let products;
           const count = await cursor.count();
           if(page){
             products = await cursor.skip(page*size).limit(size).toArray();
           }
           else{
            const products = await cursor.toArray();
           }
           
           
           res.send({
               count,
               products
           });
       })

       //use post to get data by keys
       app.post('/products/byKeys', async (req, res) =>{
           const keys = req.body;
           const query = {key: {$in: keys}}
           const products = await productCollection.find(query).toArray()
           res.json(products);
       })

       // add orders API 
       app.post('/orders', async(req, res) => {
           const order = req.body;
           order.createdAt = new Date();
           const result = await orderCollection.insertOne(order);
           
           res.json(result)
       })

       //add orders API 
       app.get('/orders', async(req, res) => {
           let query = {};
           const email = req.query.email;
           if(email) {
             query = {email: email}
           }
           const cursor = orderCollection.find(query);
           const orders = await cursor.toArray();
           res.json(orders);
       })

    }
    finally{
        //await client.close()
    }

}
run().catch(console.dir)
















app.get('/', (req, res) => {
    res.send('emajon server is running')
})

app.listen(port, () => {
    console.log('emajon server listening on port', port)
})
