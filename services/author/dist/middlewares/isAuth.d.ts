import type { NextFunction, Request, Response } from "express";
export interface AuthenticatedRequest extends Request {
    userId?: string;
}
export declare const isAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=isAuth.d.ts.map