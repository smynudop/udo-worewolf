<script setup lang="ts">
import {ref} from "vue"
import { IAbilityData } from "../../server/game/player";
import { IAbilityType } from "../../server/game/command";
const emits = defineEmits<{
    (e: "ability", data: IAbilityData)
}>()
const props = defineProps<{
    type: IAbilityType
}>()
const target = ref<number>(0)
const ability = () => {
    emits("ability", {target: target.value, type: props.type})
}
</script>

<template>
    <div>
        <div>
            能力実行：
            <select v-model="target"></select>
            <input type="button" value="[コマンド]" @click="ability">					
        </div>
        <div class="alert hide">
            未実行です
        </div>
    </div>
</template>