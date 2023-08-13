import { Schema } from "mongoose"

export type IUser = {
    userid: string
    password: string
    trip: string
}

export const UserSchema = new Schema<IUser>({
    userid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    trip: String,
})
