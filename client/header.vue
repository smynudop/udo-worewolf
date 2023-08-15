<script setup lang="ts">
import { IGame } from "../server/db/schema/game"

const props = defineProps<{
    vinfo: IGame | undefined
}>()
</script>

<template>
    <header>
        <h1 id="title">{{ props.vinfo?.name ?? "人狼" }}</h1>
        <span id="pr">{{ props.vinfo?.pr ?? "" }}</span>
        <span id="phase"></span><span id="timer"></span>
        <div class="top"><a href="/worewolf">トップへ</a></div>
    </header>
</template>

<style scoped>
header {
    font-size: 16px;
    width: 100%;
    height: 40px;
    background-color: var(--header-color);
    padding: 0px 10px;
    position: relative;
    margin: 0 auto;
}

header.word {
    background-color: var(--word-header-color);
}

header .top {
    position: absolute;
    right: 5px;
    bottom: 5px;
}
header h1 {
    font-size: 24px;
    line-height: 40px;

    margin: 0;
    padding: 0;
    display: inline;
}

#second {
    font-weight: bold;
    font-size: 24px;
}

#n-second {
    color: red;
    font-weight: bold;
    font-size: 24px;
}
</style>
