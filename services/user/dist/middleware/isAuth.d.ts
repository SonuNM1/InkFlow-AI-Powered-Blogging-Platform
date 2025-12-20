import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../model/user.model.js";
export interface AutheticatedRequest extends Request {
    user?: IUser | null;
}
export declare const isAuth: (req: AutheticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=isAuth.d.ts.map