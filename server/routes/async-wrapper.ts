import { RequestHandler, Request, Response, NextFunction } from "express"

interface PromiseRequestHandler {
    (req: Request, res: Response, next: NextFunction): Promise<any>
}

export const routerAsyncWrap = (fn: PromiseRequestHandler): RequestHandler => {
    return (req, res, next) => fn(req, res, next).catch(next)
}
