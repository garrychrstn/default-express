import { Router } from 'express'
import { User } from '../mongoose/schemas/user.js'
import { matchedData, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { Role } from '../mongoose/schemas/role.js'
import { isAdmin } from './middleware.js'


const router = Router()

router.post('/role/new', async (requ, resp) => {
    const { body } = requ
const check = validationResult(requ)
    if (!check.isEmpty()) {
        return resp.status(400).json({
            message: check.array()
        })
    }
    const newRole = await Role.create(body)

    try {
        const role = await newRole.save()
        if (role) {
            return resp.status(201).json({
                message: 'Role created successfully',
                data: role,
            })
        }
    } catch (error) {
        resp.status(500).json({
            message: 'Error creating role',
            error: error,
        })
    }
})

router.post('/register', isAdmin, async (requ, resp) => {
    const { body } = requ
    const check = validationResult(requ)
    if (!check.isEmpty()) {
        return resp.status(400).json({
            message: check.array()
        })
    }
    const saltRound = 10
    bcrypt.hash(body.password, saltRound, async function(err, hash) {
        if (err) {
            return resp.status(500).json({
                message: 'Error creating user',
                error: err,
            })
        }
        body.password = hash
        const role = await Role.findOne({ 
            name: body.role
        })
        body.role = role._id
        const newHandler = await User.create(body)
        try {
            const handler = await newHandler.save()
            if (handler) {
                role.users.push(handler._id)
                await role.save()
                return resp.status(201).json({
                    message: 'User created successfully',
                    data: handler,
                })
            }
        } catch (error) {
            resp.status(500).json({
                message: 'Error creating user',
                error: error,
            })
        }
    });

})

router.get('/team', async (requ, resp) => {
    const roles = await Role.find({})
    .populate({
        path: 'users',
        select: '-password -role -_id'
    }).exec()
    const teams = await User.find({})
    resp.status(200).json({
        message: 'Roles fetched successfully',
        roles: roles,
        teams: teams
    })
})

router.get('/users', async (requ, resp) => {
    const users = await User.find({})
    resp.status(200).json({
        message: 'Users fetched successfully',
        users: users
    })
})

router.get('/roles', async (requ, resp) => {
    const roles = await Role.find({})
    resp.status(200).json({
        message: 'Roles fetched successfully',
        roles: roles
    })
})


export default router