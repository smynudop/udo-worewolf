declare global {
    namespace Express {
        interface Request {
            // 拡張される何かのパラメーター
            session: { userid: string | undefined; rd: string | undefined } // TODO
            user?: any // TODO
        }
    }
}

declare module "express-session" {
    interface SessionData {
        userid?: string
        rd?: string
    }
}

export {}
