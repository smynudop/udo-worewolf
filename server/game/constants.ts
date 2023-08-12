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
