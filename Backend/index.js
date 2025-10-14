const express = require("express");

//cors() allows these cross-rigin requests so your frontend can talk to backend
const cors = require("cors");//cross origin Resource sharing
const bcrypt = require("bcrypt");
const mysql = require("mysql2");

const app = express();


//Normally Browsers block requests coming from a different domain(or port)than your server.
app.use(cors());
app.use(express.json());

//parses incoming req with URL-encoded payloads and makes data available under req.body.
//true: Can parse nested objects
//false: Can only parse simple key-value pairs.
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

const connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: 'NewStrongPassword123',
    database: 'myDiary'
});

connection.connect((err) =>{
    if(err){
        console.error('Error connecting to the database: ',err);
    }
    console.log('Connected to the MySQL database!');
})

app.get('/',(req,res)=>{
    console.log(req);
    res.status(200).send({message:"Hello! Server is running."});
})

app.post('/registerUser',async(req,res) =>{
    console.log(req.body);
    const{email,password} = req.body;
    try{
        const hashedPassword = await bcrypt.hash(password,10);
        console.log("Hashed Password: ", hashedPassword)
        connection.query(`insert into Users(EmailID,HashedPassword) values('${email}','${hashedPassword}')`,(err,results) =>{
            if(err){
                console.log(err);
                res.status(500).send('no');
            }    
            return res.status(200).send('OK');
        });
    }
    catch(e){
        return res.status(500).send("Error while hashing password");
    }
})

app.post('/userLogin',async(req,res)=>{
    console.log(req.body);
    const{email,password} = req.body;
    let hashedPassword = '';
    let userID = ''
    connection.query(`select ID,HashedPassword from Users where EmailID='${email}'`, async (err, result) => {
        if (err) {
            res.status(500);
            return
        }
        if (result.length === 0) {
            // No user found
            return res.status(401).send("User not found");
        }
            // console.log("Line 63: ",result);
        hashedPassword = result[0].HashedPassword;
        userID = result[0].ID;
        let response = await bcrypt.compare(password, hashedPassword)
        if (response) {
            res.status(200).json({ userID: userID });
            return
        }
        else {
            res.status(500)
            return
        }
    })
});
app.post('/newPost',async(req,res) =>{
    const{postTitle,postDescription,UserID} = req.body;
    connection.query(`insert into Posts(UserID,postTitle,postDescription) values(${UserID},"${postTitle}","${postDescription}")`,(err,results) =>{
        if(err){
            res.status(500).send("Error adding post");
            return;
        }
        res.status(200).send("Post added successfully");
    });
    console.log(req.body);

})

app.get('/getMyPosts',async(req,res) =>{
    connection.query(`select * from posts where UserID =${req.query.UserID}`,(err,result) =>{
        if(err){
            res.status(500);
            return;
        }
        res.status(200).send(result);
    })
    console.log(req.body);
})


app.get("/getPost/:id", (req, res) => {
  const postID = req.params.id;

  connection.query("SELECT * FROM Posts WHERE ID = ?", [postID], (err, results) => {
    if (err) {
      console.error("Error fetching post:", err);
      res.status(500).json({ message: "Database error" });
    } else if (results.length === 0) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.status(200).json({ post: results[0] });
    }
  });
});

app.listen(3000,() =>{
    console.log("Server running at http://localhost:3000");
});