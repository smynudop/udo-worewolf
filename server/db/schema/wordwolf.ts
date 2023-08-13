import { Schema } from "mongoose"

export type IWordWolfTime = {
  setWord: number
  discuss: number
  counter: number
}
export type IWordWolf = {
  vno: number
  name: string
  pr: string
  time: IWordWolfTime
  GMid: string
  state: string
}

export const WordwolfSchema = new Schema<IWordWolf>({
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
