const express = require('express')
const cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser')

const connectDB = require('./config/db')
const router = require('./routes')
const bodyParser = require('body-parser');





const app = express()

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true
}))


app.use(express.json())
app.use(cookieParser())

app.use("/api",router)



const PORT = 8080 || process.env.PORT


connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("connnect to DB")
        console.log("Server is running "+PORT)
    })
})
