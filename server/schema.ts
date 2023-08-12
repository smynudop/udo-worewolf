import * as Mongoose from "mongoose"

type IUser = {
    userid: string,
    password: string,
    trip: string
}

export const UserSchema = new Mongoose.Schema<IUser>({
    userid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    trip: String,
})

type ITime = {
    day: number
    vote: number
    night: number
    ability: number
    nsec: number
}

type IGame = {
    vno: number
    name: string,
    pr: string
    casttype: string
    time: ITime,
    capacity: number,
    GMid: string,
    state: string,
    kariGM: boolean
}

export const GameSchema = new Mongoose.Schema<IGame>({
    vno: { type: Number, required: true },
    name: { type: String, required: true },
    pr: { type: String, required: true },
    casttype: { type: String, required: true },
    time: {
        day: Number,
        vote: Number,
        night: Number,
        ability: Number,
        nsec: Number,
    },
    capacity: { type: Number, required: true },
    GMid: { type: String, required: true },
    state: { type: String },
    kariGM: { type: Boolean },
})
type IWordWolfTime = {
    setWord: number
    discuss: number
    counter: number
}
type IWordWolf = {
    vno: number
    name: string
    pr: string
    time: IWordWolfTime
    GMid: string
    state: string
}

export const WordwolfSchema = new Mongoose.Schema<IWordWolf>({
    vno: { type: Number, required: true },
    name: { type: String, required: true },
    pr: { type: String, required: true },
    time: {
        setWord: Number,
        discuss: Number,
        counter: Number,
    },
    GMid: { type: String, required: true },
    state: { type: String },
})

export const User = Mongoose.model("User", UserSchema)
export const Game = Mongoose.model("Game", GameSchema)
export const Wordwolf = Mongoose.model("Wordwolf", WordwolfSchema)
