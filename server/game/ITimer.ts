export type ITimer = {
    setNsec: (sec: number) => void
    clearTimer: () => void
    leftSeconds: () => number | null
    setTimer: (callback: () => void, sec: number) => void
    isBanTalk: boolean
}
