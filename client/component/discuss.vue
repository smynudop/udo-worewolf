<script setup lang="ts">
import { EachLog } from "../../server/game/log"
import Log from "./log.vue"

const props = defineProps<{
    logs: EachLog[]
}>()
</script>

<template>
    <table id="discuss">
        <tbody>
            <template v-for="log in props.logs">
                <Log :log="log"></Log>
            </template>
        </tbody>
    </table>
</template>

<style scoped>
table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0px 3px;

    line-height: 1.6;
}

.talk blockquote {
    font-size: 90%;
    border: 1px solid #666;
    margin: 5px 5px 5px 0px;
    padding: 10px;
    border-radius: 3px;

    position: relative;
}

blockquote div.resno {
    position: absolute;
    right: -1px;
    top: -1px;

    width: 60px;
    height: 16px;

    border-radius: 3px;
    font-size: 12px;
    background-color: #454545;
    color: white;
    text-align: center;
}
</style>
