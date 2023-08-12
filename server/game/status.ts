export const Abilities = {
  /** 占い師の占い能力です。 */
  fortune: "fortune",

  /** 霊能者の霊能能力です。 */
  necro: "necro",

  /** 狩人の護衛能力です。 */
  guard: "guard",

  /** 蘇生者の蘇生能力 */
  revive: "revive",

  /** 狼の襲撃能力 */
  bite: "bite",
} as const satisfies Record<string, string>
export type IAbility = keyof typeof Abilities

export const Status = {
  /** 占われると無惨死体になる */
  melt: "melt",

  /** 猫又の返り討ち（襲撃、両方） */
  standoff: "standoff",

  /** 返り討ちに遭った */
  stand: "stand",

  /** 狼に襲撃されても死なない */
  resistBite: "resistBite",

  /** useDecoyを持つ者が襲撃されたとき、代わりに死体になる */
  decoy: "decoy",

  /** 襲撃されたとき、deocyが生きていればデコイを犠牲に襲撃を免れる */
  useDecoy: "useDecoy",

  /** 生存している妖狐がいなくなったとき、後追いする */
  fellowFox: "fellowFox",

  /** 初日犠牲者の役職を知ることができる */
  knowdamy: "knowdamy",

  /** 人狼に襲撃されても死なず、狼の襲撃対象から除外される */
  notBitten: "notBitten",
} as const satisfies Record<string, string>
export type IStatus = keyof typeof Status

export const TemporaryStatus = {
  /** 最多得票を獲得し、処刑が決定した */
  maxVoted: "maxVoted",

  /** 狼に噛まれた */
  bitten: "bitten",

  /** 襲撃を行った人狼である */
  biter: "biter",

  /** 処刑された(maxVotedとどう違うんだっけ・・・) */
  executed: "executed",

  /** 護衛職に護衛され、襲撃が無効な状態 */
  guarded: "guarded",

  /** 占われた */
  fortuned: "fortuned",

  /** 襲撃された(bittenとどう違うんだっけ……) */
  eaten: "eaten",
} as const satisfies Record<string, string>

export type ITemporaryuStatus = keyof typeof TemporaryStatus
