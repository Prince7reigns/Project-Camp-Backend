import express from "express"
import cors from "cors"
import cookieparser from "cookie-parser"
const app = express();

//basic config
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieparser())

// cors config
app.use(cors({
    origin:process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    Credential:true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization"]

}))

import healthCheckRouter from "./routes/healthcheck.route.js"
import authRouter from "./routes/user.route.js"

app.use("/api/v1/healthcheck",healthCheckRouter)
app.use("/api/v1/auth",authRouter)
export default app
