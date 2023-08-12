const Phases = [
  "prologue",
  "day",
  "vote",
  "night",
  "ability",
  "epilogue",
] as const
export type IPhase = (typeof Phases)[number]

const TalkTypes = [
  "discuss",
  "wolf",
  "share",
  "fox",
  "tweet",
  "grave",
  "gmMessage",
] as const
export type ITalkType = (typeof TalkTypes)[number]

const Sides = ["human", "wolf", "fox"] as const
export type ISide = (typeof Sides)[number]

const Species = ["human", "wolf", "fox"] as const
export type ISpecies = (typeof Species)[number]

export type IResult = ISide | "draw"

const Vitals = ["alive", "death"] as const
export type IVital = (typeof Vitals)[number]
