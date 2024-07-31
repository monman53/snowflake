import './assets/main.css'

import { createApp, ref } from 'vue'
import App from './App.vue'
import { resetAllParameter } from './utils'

export const app = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  computeRadius: 1 << 9,
  reset: true,
  pause: false,
  iteration: 0,
  iterPerFrame: 32,
  fps: 0
})

export const fps = ref(0)

resetAllParameter()

const resize = () => {
  app.value.width = window.innerWidth
  app.value.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

createApp(App).mount('#app')
