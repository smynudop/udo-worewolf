import App from "./worewolf.vue"
import { createApp, h } from "vue"

console.log(App)

createApp({
    render: () => h(App),
}).mount("#app")
