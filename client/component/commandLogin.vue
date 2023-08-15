<script setup lang="ts">
import { ref } from "vue"
import type { IUpdatePlayerData } from "../../server/game/player"
const emits = defineEmits<{
    (e: "enter", data: IUpdatePlayerData): void
}>()
const enterInfo = ref<IUpdatePlayerData>({ cn: "", color: "" })
const enter = () => {
    emits("enter", enterInfo.value)
}
</script>

<template>
    <div id="command-login">
        名前:
        <input id="name" type="text" v-model="enterInfo.cn" />
        色：
        <select v-model="enterInfo.color">
            <option value="red">赤</option>
            <option value="pink">ピンク</option>
            <option value="orange">オレンジ</option>
            <option value="yellow">黄色</option>
            <option value="green">緑</option>
            <option value="skyblue">水色</option>
            <option value="blue">青</option>
            <option value="indigo">藍</option>
            <option value="purple">紫</option>
            <option value="black">黒</option>
        </select>
        <input id="enter" type="button" value="入室" @click="enter" />
    </div>
</template>

<style scoped>
#command-login {
    background-color: paleturquoise;
}
</style>
