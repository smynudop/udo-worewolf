<script setup lang="ts">
import { ref, computed } from "vue"
import { IGame } from "../../server/db/schema/game"

const props = defineProps<{
    setting: IGame
}>()
const emits = defineEmits<{
    (e: "update:setting", data: IGame): void
    (e: "update"): void
}>()

const setting = computed({
    get() {
        return props.setting
    },
    set(value: IGame) {
        emits("update:setting", value)
    },
})
</script>

<template>
    <div class="command-gm">
        <div class="handle">▼村の設定</div>
        <div class="detail">
            <div class="box">
                <input type="button" value="ゲーム開始" class="big" id="gameStart" />
            </div>
            <div class="box">
                <input type="button" value="配役確認" class="big" id="checkCast" />
            </div>
            <div class="box">
                <input type="button" value="村情報修正" class="big" id="fixVillageInfo" />
            </div>
            <div class="box"><input type="button" value="点呼" id="rollcall" class="big" /></div>
            <div class="box">
                <input type="button" value="NPC召喚" id="summonNPC" class="big debug" />
            </div>
            <div class="box">
                <select id="gmTarget"></select
                ><br />
                <input type="button" value="キック" id="kick" />
            </div>
        </div>
        <div id="vinfo">
            <div>村名</div>
            <input type="text" v-model="setting.name" class="long" /><br />
            <div>PR</div>
            <input type="text" v-model="setting.pr" class="long" /><br />
            <div>昼</div>
            <input type="number" v-model="setting.time.day" />
            <div>投票</div>
            <input type="number" v-model="setting.time.vote" />
            <div>夜</div>
            <input type="number" v-model="setting.time.night" />
            <div>能力</div>
            <input type="number" v-model="setting.time.ability" />
            <div>n秒</div>
            <input type="number" v-model="setting.time.nsec" /><br />
            <div>定員</div>
            <input type="number" v-model="setting.capacity" />
            <div>配役</div>
            <select v-model="setting.casttype">
                <option value="Y">Y</option>
                <option value="W">W</option>
                <option value="M0">桃栗なし</option>
                <option value="M1">桃栗あり</option>
                <option value="MA">桃栗A</option>
                <option value="MB">桃栗B</option>
                <option value="MC">桃栗C</option>
                <option value="MF">桃栗F</option>
            </select>
            <div>霊界表示</div>
            <select v-model="setting.isShowJobDead">
                <option :value="true">はい</option>
                <option :value="false">いいえ</option></select
            ><br />
            <input type="button" value="変更" id="fix-gm" />
        </div>
    </div>
</template>

<style>
.command-gm {
    background-color: #d0d0d0;
}
</style>
