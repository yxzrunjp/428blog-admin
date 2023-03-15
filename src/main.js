import { createApp } from 'vue'
import '@/assets/style.css'
import App from './App.vue'
import router from '@/router'

// pinia
import { createPinia } from 'pinia'

// 图标
import '@/assets/icon/iconfont.css'

// utils
import Request from '@/utils/Request'
import Message from '@/utils/Message'
import Confirm from '@/utils/Confirm'

// 自定义组件
import Table from '@/components/Table.vue'
import Cover from '@/components/Cover.vue'
import Dialog from '@/components/Dialog.vue'
import CoverUpload from '@/components/CoverUpload.vue'
import Window from '@/components/Window.vue'

const app = createApp(App);
app.use(createPinia())
app.use(router)

app.config.globalProperties.Request = Request
app.config.globalProperties.Message = Message
app.config.globalProperties.Confirm = Confirm

app.config.globalProperties.globalInfo = {
    imageUrl: '/api/file/getImage/',
}

app.component('Table', Table)
app.component('Cover', Cover)
app.component('Dialog', Dialog)
app.component('CoverUpload', CoverUpload)
app.component('Window', Window)

app.mount('#app')
