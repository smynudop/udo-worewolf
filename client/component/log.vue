<script setup lang="ts">
import { eachLog } from "../../server/game/log"
const props = defineProps<{
    log: eachLog
}>()
</script>

<template>
    <tr :class="props.log.class">
        <template v-if="props.log.type == 'system'">
            <td colspan="2">{{ props.log.message }}</td>
        </template>
        <template v-else>
            <td>
                <span :class="props.log.color">◆</span>
                {{ props.log.cn }}
            </td>
            <td class="talk" :class="props.log.size">
                {{ props.log.message }}
                <!-- todo anchor-->
            </td>
        </template>
    </tr>
</template>

<style scoped>
td {
    padding: 5px 5px;
}

td.name {
    width: 140px;
    max-width: 140px;
    vertical-align: top;
}

td.talk {
    position: relative;

    padding-right: 25px;
    width: 590px;
    max-width: 590px;
    overflow: hidden;
}

table.votesummary {
    margin-left: 37px;
    line-height: 1.5;
    font-weight: normal;
    border-collapse: separate;
    border-spacing: 0px 0px;
}

table.votesummary td {
    padding: 0;
}

#discuss td[colspan] {
    border-right: 1px solid #bbb;
    border-bottom: 1px solid #bbb;
}

.progress > td,
.personal > td,
.wolf-system > td {
    line-height: 32px;
}

.progress td {
    background-color: var(--progress-color);
}

td img {
    display: inline-block;
    vertical-align: bottom;
    margin-right: 5px;
    width: 32px;
    /*background-color: white;*/
}

tr.system > td {
    background-color: var(--system-color);
    padding-top: 0.5em;
    padding-bottom: 0.5em;
}

/* #discuss div.quote {
    width: 20px;
    height: 20px;
    background-color: #333;
    border-radius: 2px;
    position: absolute;
    top: 3px;
    right: 0px;
    background: url(../images/quote.png) no-repeat center #666;
    cursor: pointer;
} */

tr.discuss td.talk.big {
    color: crimson;
    font-weight: bold;
}

tr.discuss td.talk.small {
    font-size: 90%;
    color: teal;
}
</style>
