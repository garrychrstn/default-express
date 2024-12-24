import { User } from '../mongoose/schemas/user.js';
import { Role } from '../mongoose/schemas/role.js';
import jwt from 'jsonwebtoken'
import readline from 'readline';
import bcrypt from 'bcrypt'
import { ErrorLog } from '../mongoose/schemas/error.js';

const askQuestion = async (rl, query) => {
    return new Promise((resolve) => {
        rl.question(query, answer => {
            resolve(answer)
        })
    })
}

export const initiateAdmin = async () => {
    console.log('[LOG] Admin checks...')
    try {
        const uAdmin = await User.findOne({ username: 'admin' })
        const rAdmin = await Role.findOne({ name: 'admin' })
        if (uAdmin && rAdmin) {
            console.log('[LOG] Admin already exists')
            return
        } else {
            console.log('[LOG] Creating admin...')
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            const nrAdmin = await Role.create({
                name: 'admin',
                phone: '0001',
                email: '-',
                description: 'Admin',
            })
            const admin = ['username', 'email', 'password']
            let nadmin = {}
            console.log('Create new account that will be given admin previllege :')
            for (const field of admin) {
                nadmin[field] = await askQuestion(rl, `Enter ${field} : `)
            }
            bcrypt.hash(nadmin.password, 10, async function(err, hash) {
                if (err) {
                    console.log(err)
                    return
                }
                const nuAdmin = await User.create({
                    username : nadmin.username,
                    email: nadmin.email,
                    password : hash,
                    role: nrAdmin._id
                })
                nrAdmin.users.push(nuAdmin._id)
                await nrAdmin.save()
                console.log('[LOG] Admin created')
            })
            rl.close();
        }
        
    } catch (error) {
        await ErrorLog.create({
            at: 'utils/initiateAdmin',
            message: error
        })
    }
}

export const verifyRefreshToken = async (refToken) => {
    console.log('[TOKEN-EXPIRED] START-REFRESHING')
    console.log(refToken)
    let isRefresh
    try {
        const refTokenDecoded = jwt.verify(refToken, process.env.JWT_SECRET)
        const user = await User.findOne({
            activeRefreshToken: refToken
        })
        console.log('user : ', user?.username)
        isRefresh = {
            result: false
        }
        if ( user ) {
            isRefresh.result = true
            isRefresh.username = user.username
            isRefresh.id = user._id
        }
    } catch (error) {
        console.log(error)
    }
    return isRefresh
}

export const fetchRoleByPhone = async (phoneNumber) => {
    
    const role = await Role.findOne({
        phone: phoneNumber
    })
    if (!role) {
        return null
    }
    return role
}

export const fetchRoleByName = async (roleName) => {
    
    const role = await Role.findOne({
        name: roleName
    })
    if (!role) {
        return null
    }
    return role
}

