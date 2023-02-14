<template>
    <div class="editor-html" style="border: 1px solid #ccc">
        <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig"
            :mode="mode" />
        <Editor :style="{ height: editorHeight-80 + 'px', 'overflow-y': 'hidden' }" :modelValue="modelValue"
            :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated" @onChange="change" />
    </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount, shallowRef, } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
// 内容 HTML
// const valueHtml = ref('')
// 模拟 ajax 异步获取内容
// onMounted(() => {
//     setTimeout(() => {
//         valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
//     }, 1500)
// })
const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    editorHeight: {
        type: Number,
        default: 500,
    }
})
// valueHtml.value = props.value
const emit = defineEmits(['update:modelValue'])//htmlChange
const change = (editor) => {
    emit('update:modelValue',editor.getHtml())
}
const toolbarConfig = {}
const editorConfig = { 
    placeholder: '请输入内容...',
    MENU_CONF:{
        uploadImage:{
            maxFileSize:3*1024*1024,
            server:'/api/file/uploadImage4WangEditor',
            customInsert(res,insertFn){
                insertFn(res.data.url,"","")
            }
        }
    }
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor) => {
    editorRef.value = editor // 记录 editor 实例，重要！
}



const mode = 'default'//simple
</script>

<style lang="scss" scoped>

</style>