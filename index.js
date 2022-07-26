const express = require('express')

const app = express();

const cors = require('cors');

const mongodb = require('mongodb'); 

const mongoClient = mongodb.MongoClient;

const dotenv = require("dotenv").config();

const URL= process.env.DB;

app.use(cors({ origin: '*' }));
    
app.use(express.json());



// 1.Add new book in DB

app.post("/books", async function(req,res){
 
    try{
        //open connection to mongodb
    
        const connection = await mongoClient.connect(URL);
    
        //select db 
    
        const db = connection.db("b35wd");
    
        //select collection and operation
    
         await db.collection("books").insertOne(req.body);
    
        //close connection
    
        await connection.close();
        res.json({
            message : "books added successfully"
        })
    }
    catch(error){
        console.log(error)
    }
    })

// 2.Show available books

app.get("/books", async function(req,res){

try{
    //open connection to mongodb

    const connection = await mongoClient.connect(URL);

    //select db 

    const db = connection.db("b35wd");

    //select collection and operation

    let book = await db.collection("books").find({}).toArray();

    //close connection

    await connection.close();
    res.json(book)
}
catch(error){
    console.log(error)
}
})


// app.get("/books/:id", function(req, res){
//     const id = req.params.id 
//     // console.log(id)
//     const book = bookArray.find(book => book.id == id);
//     res.json(book)
// })



// 3. Search books with book name and Author name

app.get("/books/:name", async function(req,res){

    try{
        //open connection to mongodb
    
        const connection = await mongoClient.connect(URL);
    
        //select db 
    
        const db = connection.db("b35wd");
    
        //select collection and operation
    // console.log(req.params.name)
        let data = await db.collection("books").find(
            {
            "$or":[

                {"BookName" : {$regex : req.params.name}},
                {"AuthorName" : {$regex : req.params.name}}
            ]
            }).toArray();
    
        //close connection
        
    
        await connection.close();
        res.json(data)
    }
    catch(error){
        console.log(error)
    }
    })


//4. Remove book from Library using ID


app.delete("/books/:id",async function(req,res){

    const connection = await mongoClient.connect(URL)
    const db = connection.db("b35wd");
    await db.collection("books").deleteOne({_id : mongodb.ObjectId(req.params.id)})
    await connection.close();
    res.json({
        message : 'book deleted successfully'
    })
})


//5.When user get one book from library, the other user are eligble to show after 10 minutes


app.put("/books/:id", async function(req,res){

    try{
        //open connection to mongodb
    
        const connection = await mongoClient.connect(URL);
    
        //select db 
    
        const db = connection.db("b35wd");
    
        //select collection and operation
        // console.log(req.body.Availability)

        let avail = await db.collection("books").findOne({_id : mongodb.ObjectId(req.params.id)})

        let status = avail.Availability

        if(status == true){

            // book is availble to take and read

         let book = await db.collection("books").updateOne({_id: mongodb.ObjectId(req.params.id)}, {$set: {Availability : false}});
            
        }
        else{
            
            // book is not availble please wait 10min

             // setTimeout( async () => {
            let book = await db.collection("books").updateOne({_id: mongodb.ObjectId(req.params.id)}, {$set: {Availability : true}});
             //   }, 10000)
 }

    
        await connection.close();
        status ? res.json({message : "book is available"}) : res.json({message : "book is not available please wait 10 minutes"})
   
}
    catch(error){
        console.log(error)
    }
    })




app.listen(process.env.PORT || 4000)