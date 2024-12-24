import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../mongoose/schemas/user.js';
import bcrypt from 'bcrypt'
import { Role } from '../mongoose/schemas/role.js';

const router = express.Router();
dotenv.config();

router.post('/login', async (requ, res) => {
    console.log('-------------------------login-------------------------')
    try {
        
        const { usernameOrEmail, password } = requ.body;
        const isEmail = requ.body.usernameOrEmail.includes('@')
        let user
        if (isEmail) {
            user = await User.findOne({ email: usernameOrEmail })
        } else {
            user = await User.findOne({ username: usernameOrEmail })
        }
        if (!user) {
            return res.status(401).json({ style: 'text', result: 'error',  message: 'Invalid Credentials', code: 'red' });''
        }
        const result = bcrypt.compareSync(password, user.password); 
        if (!result) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );
        const now = new Date().getTime();
        const refreshToken = jwt.sign(
            { id: user._id, username: user.username, lastRefresh: now },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        )
        const setLastLoginAndRef = await user.updateOne({ 
            lastLogin: now,
            lastRefresh: now,
            activeRefreshToken: refreshToken,
        })
        if (!setLastLoginAndRef) {
            console.log('[ERROR] Failed to update last login')
        }
        
        const discardProp = ['password', '__v', '_id', 'users']
        const role = await Role.findOne({ _id: user.role })
        const r = role.toObject()
        Object.keys(r).forEach(key => {
            if (discardProp.includes(key)) {
                delete r[key];
            } 
        })
        const u = user.toObject()
        u.role = r
        Object.keys(u).forEach(key => {
            if (discardProp.includes(key)) {
                delete u[key];
            } else {
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/',
            // sameSite: 'none',
            // secure: false,
        })
        console.log('refToken', refreshToken)
        res.json({ 
            token: `Bearer ${token}`,
            user: u,
            refToken: refreshToken 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;