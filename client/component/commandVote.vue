<script setup lang="ts">
import { ref } from "vue"
import { IVoteData } from "../../server/game/player"
import { IAbilityType } from "../../server/game/command"
const emits = defineEmits<{
    (e: "vote", data: IVoteData)
}>()
// const props = defineProps<{
// }>()
const target = ref<number>(0)
const vote = () => {
    emits("vote", { target: target.value })
}
</script>

<template>
    <div>
        <div>
            投票：<select id="voteTarget"></select>
            <input type="button" value="投票" @click="vote" />
        </div>
        <div class="alert">未投票です</div>
    </div>
</template>

<style scoped>
div.alert {
    font-weight: bold;
    color: white;
    background-color: red;
    border-radius: 5px;
    font-size: 24px;
}

div.alert.hide {
    visibility: hidden;
}
</style>
