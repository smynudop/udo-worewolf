import { Mongoose, Model } from "mongoose"
import { UserSchema } from "./schema/user"
import { GameSchema } from "./schema/game"
import { WordwolfSchema } from "./schema/wordwolf"

const mongoose = new Mongoose()

export const User = mongoose.model("User", UserSchema)
export const Game = mongoose.model("Game", GameSchema)
export const Wordwolf = mongoose.model("Wordwolf", WordwolfSchema)

export default mongoose
