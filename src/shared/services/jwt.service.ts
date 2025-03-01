import jwt from 'jsonwebtoken';
import {SETTINGS} from "../../configs/settings";

export interface JwtPayload {
    userId: string;
}

export class JwtService {
    static createJWT(userId: string, expiresIn: string): string {
        return jwt.sign(
            { userId },
            SETTINGS.JWT_SECRET,
            { expiresIn }
        );
    }

    static verifyToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, SETTINGS.JWT_SECRET) as JwtPayload;
        } catch (error) {
            return null;
        }
    }
}