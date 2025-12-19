import { requireAuth } from "@clerk/express";
import User from "../models/user.model";
import appConfig from "../config/env";

import type { NextFunction, Request, Response } from "express";

const protectRoute = [
    requireAuth(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const clerkId = (req as any).auth.userId;

            if (!clerkId) {
                return res.status(401).json({ message: "Unauthorized - invalid token" });
            }

            const user = await User.findOne({ clerkId });
            if (!user) {
                return res.status(401).json({ message: "Unauthorized - user not found" });
            }

            // Attach user to request object
            (req as any).user = user;

            next();
        } catch (error) {
            console.error("Error in protectRoute middleware:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
]

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
        return res.status(401).json({ message: "Unauthorized - user not found" });
    }

    if ((req as any).user.email !== appConfig.ADMIN_EMAIL) {
        return res.status(403).json({ message: "Forbidden - admin access only!" });
    }

    next();
}

export { protectRoute, adminOnly };