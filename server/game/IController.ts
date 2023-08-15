import {
    IAbilityData,
    IPlayerForClient,
    IPlayerforPlayer,
    IUpdatePlayerData,
    IVoteData,
} from "./player"
import { EachLog } from "./log"
import { IChangePhaseInfo } from "./game"
import { ITalkData } from "./player"
import { IGame } from "../db/schema/game"

export type IPersonalResponse = IPlayerforPlayer
export type IChangePhaseResponse = IChangePhaseInfo
export type IInitialLogResponse = EachLog[]
export type ITalkResponse = EachLog
export type EmitAllType = {
    player: IPlayerForClient[]
    changePhase: IChangePhaseInfo
    initialLog: IInitialLogResponse
    talk: ITalkResponse
    useAbilitySuccess: boolean
    refresh: boolean
    you: IPersonalResponse
    enterSuccess: IPersonalResponse
    voteSuccess: boolean
    banTalk: boolean
    leaveSuccess: boolean
}
export type EmitEvent = keyof EmitAllType

export type IEnterRequest = IUpdatePlayerData
export type IFixPlayerRequest = IUpdatePlayerData
export type ITalkRequest = ITalkData
export type IVoteRequest = IVoteData
export type IAbilityRequest = IAbilityData
export type IKickRequest = { target: number }
export type IFixGameRequest = IGame
export type RecieveAllType = {
    connect: null
    enter: IEnterRequest
    leave: null
    fixPlayer: IFixPlayerRequest
    talk: ITalkRequest
    vote: IVoteRequest
    ability: IAbilityRequest
    rollcall: null
    start: null
    summonNPC: null
    checkCast: null
    kick: IKickRequest
    fixVillage: IFixGameRequest
}
export type RecieveEvent = keyof RecieveAllType

export type EventCallback<T = any> = (userid: string, data: T, manager: IController) => void

export type IController = {
    emit<T extends EmitEvent>(event: T, arg: EmitAllType[T]): void

    emitPlayer<T extends EmitEvent>(event: T, arg: EmitAllType[T]): void

    emitRoom<T extends EmitEvent>(event: T, arg: EmitAllType[T], room: string): void

    emitPersonal<T extends EmitEvent>(event: T, arg: EmitAllType[T], id: number): void

    /**
     * イベントを個人のみに送信します。
     * @param event
     * @param arg
     * @param id
     */
    emitByUserId<T extends EmitEvent>(event: T, arg: EmitAllType[T], userid: string): void

    on<T extends RecieveEvent>(event: T, callback: EventCallback<RecieveAllType[T]>): void

    dispatch<T extends RecieveEvent>(event: T, userid: string, data: RecieveAllType[T]): void

    listen(): void

    assignRoom(): void
}
