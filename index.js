const express =required('express');
const cors =required('cors');
const app = express();
const port =process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());


// root
app.get('/',(req,res)=>{
    res.send("manufacturer server is running..");
});

app.listen(port,()=>{
    console.log("Server is running on port",port);
});