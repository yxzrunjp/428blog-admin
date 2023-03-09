import { createApp } from 'vue'
import '@/assets/style.css'
import App from './App.vue'
import router from '@/router'

// pinia
import { createPinia } from 'pinia'
// element-ui
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 图标
import '@/assets/icon/iconfont.css'

// utils
import Request from '@/utils/Request'
import Message from '@/utils/Message'
import Confirm from '@/utils/Confirm'
import Verify from '@/utils/Verify'

// 自定义组件
import Table from '@/components/Table.vue'
import Cover from '@/components/Cover.vue'
import Dialog from '@/components/Dialog.vue'
import CoverUpload from '@/components/CoverUpload.vue'
import Window from '@/components/Window.vue'
import EditorMarkdown from '@/components/EditorMarkdown.vue'
import EditorHtml from '@/components/EditorHtml.vue'

// markdown编辑器
import VMdPreviewHtml from '@kangc/v-md-editor/lib/preview-html';
import '@kangc/v-md-editor/lib/style/preview-html.css';

import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';// 引入使用主题的样式

import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';

import hljs from 'highlight.js';
VMdEditor.use(githubTheme, {
    Hljs: hljs,
});


const app = createApp(App);
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(VMdPreviewHtml);
app.use(VMdEditor)

app.config.globalProperties.Request = Request
app.config.globalProperties.Message = Message
app.config.globalProperties.Confirm = Confirm
app.config.globalProperties.Verify = Verify

app.config.globalProperties.globalInfo = {
    imageUrl: '/api/file/getImage/',
}

app.component('Table', Table)
app.component('Cover', Cover)
app.component('Dialog', Dialog)
app.component('CoverUpload', CoverUpload)
app.component('Window', Window)
app.component('EditorMarkdown', EditorMarkdown)
app.component('EditorHtml', EditorHtml)

app.mount('#app')
