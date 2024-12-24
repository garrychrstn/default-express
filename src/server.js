import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config'
import login from '../routes/auth.js'
import * as Mid from '../routes/middleware.js'
import rUser from '../routes/ro-user.js'
import { initiateAdmin } from '../utils/utils.js';

const server = express()
const PORT = process.env.PORT || 5200;
server.use(cors())
server.use(express.json())

server.use('/api/v1', login)
server.use('/api/v1', Mid.checkToken)
server.use('/api/v1', rUser)

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB')
    initiateAdmin()
})
.catch(err => {
    console.log(err)
})
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

