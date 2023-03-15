<template>
    <div class="md-editor-box" :style="{ width: '100%' }">
        <v-md-editor :modelValue="modelValue" :height="editorHeight + 'px'" :disabled-menus="[]"
            :include-level="[1, 2, 3, 4, 5, 6]" @upload-image="handleUploadImage" @change="change">
        </v-md-editor>
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue';
// markdown编辑器
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';// 引入使用主题的样式

import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';

import hljs from 'highlight.js';
VMdEditor.use(githubTheme, {
    Hljs: hljs,
});


const { proxy } = getCurrentInstance();

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



const handleUploadImage = async (event, insertImage, files) => {
    const result = await proxy.Request({
        url: '/file/uploadImage',
        dataType: 'file',
        params: {
            file: files[0],
            type: 1,
        },
    })
    if (!result) {
        return
    }
    const url = proxy.globalInfo.imageUrl + result.data.fileName;
    // 拿到 files 之后上传到文件服务器，然后向编辑框中插入对应的内容
    insertImage({
        url,
        desc: '图片',
        // width: 'auto',
        // height: 'auto',
    });
}
const emit = defineEmits(['update:modelValue', 'htmlContentChange'])
const change = (mdContent, htmlContent) => {
    emit('update:modelValue', mdContent)
    emit('htmlContentChange', htmlContent)
}
</script>

<style lang="scss" scoped>

</style>