<script lang="ts" setup>
import { ref } from "vue"
import { ITalkDetail } from "../../server/game/command"
import { ITalkData } from "../../server/game/player"

const props = defineProps<{
    command: ITalkDetail[]
}>()
const emits = defineEmits<{
    (e: "talk", data: ITalkData)
}>()
const data = ref<ITalkData>({
    size: "",
    type: "discuss",
    message: "",
})
const talk = () => {
    emits("talk", data.value)
}
</script>

<template>
    <div class="talk-container">
        <textarea autocomplete="off" rows="5" cols="60" v-model="data.message"></textarea>
        <input id="chat" type="button" value="発言" @click="talk" />
        <div id="option">
            <div class="size big">太</div>
            <div class="size small">小</div>
            <br />
            <select v-model="data.type">
                <option v-for="com in props.command" :value="com.type">{{ com.text }}</option>
            </select>
        </div>
    </div>
</template>

<style scoped>
.talk-container {
    display: flex;
}

.size {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid #999;
    background-color: white;
    border-radius: 3px;
    line-height: 40px;
    cursor: pointer;
    margin-bottom: 10px;
    vertical-align: bottom;
    user-select: none;
}

.size.selected {
    border-color: red;
}

.size.big {
    color: crimson;
    font-weight: bold;
}

.size.small {
    color: navy;
    font-size: 90%;
}
</style>
