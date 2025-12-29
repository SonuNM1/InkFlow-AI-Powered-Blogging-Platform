import type { NextFunction, Request, Response } from "express";
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        name: string;
        image?: string;
    };
}
export declare const isAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=isAuth.d.ts.map