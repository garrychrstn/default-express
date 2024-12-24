import jwt from 'jsonwebtoken'
// import { SocketSession } from '../mongoose/schemas/socketsession.js'
import { User } from '../mongoose/schemas/user.js'
import { verifyRefreshToken } from '../utils/utils.js'
import { ErrorLog } from '../mongoose/schemas/error.js'


export const isAdmin = async (requ, res, next) => {
    const { user } = requ
    try {
        const usr = await User.findOne({ username: user.username }).populate({
            path: 'role',
        }).exec()
        if (usr.role.name != 'administrator') {
            return res.status(401).json({
                message: 'Unauthorized'
            })
        } else {
            next()
        }
    } catch (error) {
        const err = await ErrorLog.create({
            at: 'middleware/isAdmin',
            message: error
        })
    }
}

export const checkToken = async (requ, res, next) => {
    console.log('-------------------------middleware tokenAuth-------------------------')
    let token = ''
    try {
        token = requ.headers?.authorization?.split(' ')[1]
        if (!token) {
            console.log('No token provided')
            return res.status(401).json({ message: 'No Token' })
        }
    } catch (error) {
        console.log('Error : ', error)
        return res.status(401).json({ message: 'Error', yourToken: token })
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        requ.user = decoded
        console.log('Permission granted')
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            // 1. decode refresh token
            // 2. match refresh token against lastRefresh of that user
            // 3. if match, update lastRefresh to now and send new token and refresh token 
            let refToken = requ.cookies.refreshToken
            const isRefresh = await verifyRefreshToken(refToken)
            let newToken
            if (isRefresh?.result) {
                newToken = jwt.sign(
                    { id: isRefresh.id, username: isRefresh.username },
                    process.env.JWT_SECRET,
                    { expiresIn: '10m' }
                );
                return res.status(201).json({ token: `Bearer ${newToken}`})
            } else {
                console.log("[TOKEN-REFRESH] FAILED")
                return res.status(201).json({ error: 'Token Expired' })
            }
        } else {
            console.log('Error : ', error)
            return res.status(201).json({ message: 'Error', yourToken: token })
        }
    }
}


export const socketToken = async (socket, next) => {
    // let token = socket?.handshake?.auth?.token.split(' ')[1]
    // TODO create data session to store session. if it deteect jwt token that is stored in there, reject the connection
    let token = ''
    let listConn = await SocketSession.find({})
    let hitCount = 0
    try {
        token = socket?.handshake?.auth?.token.split(' ')[1]
    } catch (error) {
        hitCount++
        console.log('Error : ', hitCount)
        return next(new Error('Unauthorized: Invalid token'));
    }
    // token = token?.split(' ')[1]
    if (!token) {
        console.log('No SOCKET token provided')
        return next(new Error('Unauthorized: Invalid token'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        socket.user = decoded
        if (listConn.includes(socket.user.username)) {
            console.log(`User ${ socket.user.username } already connected`)
            return res.status(401).json({ message: 'Error', detail: 'Another connection exxist' }) /* TODO */
        }
        const u = new SocketSession({
            username: socket.user.username
        })
        const usave = await u.save()
        
        console.log(`Socket granted for ${ socket.user.username }`)
        next()
    } catch (error) {
        return next(new Error('Unauthorized: Token verification failed'));
    }
}
// create middleware to auth / assign user / role to each array
