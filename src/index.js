import dotenv from "dotenv"
import dbConnect from "./db/dbConnect.js";

dotenv.config({
    path:"./.env"
})

const port = process.env.PORT || 3000;
import app from "./app.js"

dbConnect()
.then(()=>{
  app.listen(port,()=>{
    console.log(`example app lis on port ${port}`);
});
})
.catch((err)=>{
  console.error("MongoDb connection error")
  process.exit(1)
})

app.get('/', (req, res) => {
  res.send('Hello World')
});

