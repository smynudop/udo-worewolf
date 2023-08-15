<script setup lang="ts">
import { IPlayerForClient } from "../../server/game/player"

const props = defineProps<{
    players: IPlayerForClient[]
}>()
</script>

<template>
    <div id="player">
        <div id="playernum"></div>
        <ul>
            <template v-for="pl in players">
                <li :class="{ uncall: pl.waitCall, alive: pl.isAlive, dead: !pl.isAlive }">
                    <span :class="pl.color">◆</span>{{ pl.cn }}
                    <div v-if="pl.type == 'detail'">
                        [{{ pl.status.nameja }}] {{ pl.userid }} {{ pl.trip }}
                    </div>
                </li>
            </template>
        </ul>
    </div>
</template>

<style scoped>
ul {
    padding-left: 0;
}
li {
    list-style: none;
    margin: 0;
    padding: 2px;
    border-top: 1px solid #999;
    font-size: 90%;
    line-height: 1.6;
}

li:last-of-type {
    border-bottom: 1px solid #999;
}

li.dead {
    background-color: var(--grave-bg-color);
    color: black;
}

.uncall {
    color: red;
}

.offline {
    color: red;
}
</style>
