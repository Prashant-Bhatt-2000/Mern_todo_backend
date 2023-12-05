const dotenv = require('dotenv')
const app = require('./app')
const cors = require('cors')
const mongoconnection = require('./database/mongooseConnection')

dotenv.config({path: './config/config.env'})

app.use(cors())
mongoconnection()
app.listen(process.env.PORT, ()=>  { 
    console.log(`Server is running on http:localhost:${process.env.PORT}`)
})