// config/passport.js
import pkg from 'passport-jwt';
const { Strategy: JwtStrategy, ExtractJwt } = pkg;
import passport from 'passport';
import dotenv from 'dotenv';
import { User } from '../../mongoose/schemas/user.js';

dotenv.config();

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
    try {
        const user = await User.findOne({
            _id: jwt_payload.id,
        });
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

export default passport;