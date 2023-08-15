<script setup lang="ts">
import { ref, computed } from "vue"
import WorewolfHeader from "./header.vue"
import Memo from "./component/memo.vue"
import commandLogin from "./component/commandLogin.vue"
import commandAbility from "./component/commandAbility.vue"
import commandVote from "./component/commandVote.vue"
import commandGm from "./component/commandGM.vue"
import commandOffline from "./component/commandOffline.vue"
import playersVue from "./component/players.vue"
import discuss from "./component/discuss.vue"
import Talk from "./component/talk.vue"

import SocketService from "./socketService"
import type { EachLog } from "../server/game/log"
import type {
    IPlayerforPlayer,
    IPlayerForClient,
    ITalkData,
    IVoteData,
} from "../server/game/player"
import { IGame } from "../server/db/schema/game"
import { IPhase } from "../server/game/constants"
import { IUpdatePlayerData } from "../server/game/player"
import { IAbilityData } from "../server/game/player"
import { IStatusForClient } from "../server/game/statusManager"

declare var vno: number

type IPlayerWatch = {
    type: "watch"
}

const logs = ref<Array<EachLog>>([])
const me = ref<IPlayerforPlayer | IPlayerWatch>({
    type: "watch",
})
const players = ref<IPlayerForClient[]>([])
const villageInfo = ref<IGame>({
    name: "",
    pr: "",
    time: { day: 0, vote: 0, night: 0, ability: 0, nsec: 0 },
    vno: 0,
    casttype: "Y",
    capacity: 17,
    GMid: "",
    state: "",
    kariGM: false,
    isShowJobDead: false,
})
const phase = ref<IPhase>("prologue")
const day = ref<number>(1)
const targets = ref<Record<number, string>>({})
const sec = ref<number>()
const nsec = ref<number>()
const disconnected = ref<boolean>(false)

const status = computed((): IStatusForClient => {
    if (me.value.type == "detail") {
        return me.value.status
    } else {
        return {
            name: "",
            nameja: "",
            desc: "",
            ability: [],
            target: null,
            vote: null,
            command: [],
            talkCommand: [],
        }
    }
})

const enter = (data: IUpdatePlayerData) => {
    if (data.cn.length == 0 || data.cn.length > 8) {
        alert("")
        return
    }
    mng.emit("enter", data)
}
const update = (data: IUpdatePlayerData) => {
    if (data.cn.length == 0 || data.cn.length > 8) {
        alert("")
        return
    }
    mng.emit("fixPlayer", data)
}
const vote = (data: IVoteData) => {
    mng.emit("vote", data)
}
const talk = (data: ITalkData) => {
    mng.emit("talk", data)
}
const ability = (data: IAbilityData) => {
    mng.emit("ability", data)
}
const updateVillage = () => {
    if (villageInfo.value == null) return
    mng.emit("fixVillage", villageInfo.value)
}

const mng = new SocketService("/room-" + vno, true)
mng.on("talk", (log) => {
    logs.value.unshift(log)
})
mng.on("you", (player) => {
    me.value = player
})
mng.on("player", (list) => {
    players.value = list
})
mng.on("initialLog", (list) => {
    logs.value = list
})
mng.on("disconnect", () => {
    disconnected.value = true
})
mng.on("changePhase", (data) => {
    phase.value = data.phase
    day.value = data.day
    targets.value = data.targets
    sec.value = data.left ?? undefined
    nsec.value = data.nsec ?? undefined
    if (data.villageInfo != null) {
        villageInfo.value = data.villageInfo
    }
})
mng.listen()
</script>

<template>
    <div id="container" :class="phase">
        <WorewolfHeader :vinfo="villageInfo" />
        <div class="main">
            <div class="talk">
                <Talk :command="status.talkCommand" @talk="talk" />
                <div id="job" v-if="status.desc != ''">
                    {{ status.desc }}
                </div>
                <div id="command">
                    <command-login @enter="enter" />
                    <command-login @enter="update" />
                    <command-gm v-model:setting="villageInfo" @update="updateVillage" />
                    <command-ability v-for="ab in status.ability" @ability="ability" :type="ab" />
                    <command-vote @vote="vote" />
                    <command-offline v-if="disconnected" />
                </div>
                <discuss :logs="logs" />
            </div>
            <div class="side">
                <players-vue :players="players" />
            </div>
        </div>
    </div>
    <Memo />
    <div id="memoButton">memo</div>
</template>

<style scoped>
#container {
    width: 1000px;
    margin: 0 auto;
}

#command > div {
    padding: 0.25em;
}

div.main {
    background-color: #fefefe;
    display: flex;
    padding: 0.5rem;
}

div.talk {
    width: 75%;
}

div.side {
    width: 25%;
}
</style>
