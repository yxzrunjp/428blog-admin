<template>
    <Window v-if="windowConfig.show" :buttons="windowConfig.buttons">
        <div class="detail-title">{{ blog.title }}</div>
        <v-md-preview-html :html="blog.content" preview-class="github-markdown-body"></v-md-preview-html>
    </Window>
</template>

<script setup>
import { reactive, getCurrentInstance, nextTick, } from 'vue';
import hljs from 'highlight.js';
import VMdPreviewHtml from '@kangc/v-md-editor/lib/preview-html';
import '@kangc/v-md-editor/lib/style/preview-html.css';

const { proxy } = getCurrentInstance()
const api = {
    getBlogById: '/blog/getBlogById',
}
const highlightCode = () => {
    document.querySelectorAll('pre code').forEach(el => {
        hljs.highlightElement(el)
    })
}
const blog = reactive({})
const windowConfig = reactive({
    show: false,
    buttons: [{
        type: 'primary',
        text: '返回',
        click: () => {
            closeDetail()
        }
    }],
})
const getDetail = async (blogId) => {
    const result = await proxy.Request({
        url: api.getBlogById,
        params: { blogId }
    })
    if (!result) {
        return
    }
    Object.assign(blog, result.data)
    if (blog.editorType === 0) {
        nextTick(() => {
            highlightCode()
        })
    }
}
const showDetail = (blogId) => {
    windowConfig.show = true
    getDetail(blogId)
}
const closeDetail = () => {
    windowConfig.show = false
}

defineExpose({ showDetail })
</script>

<style lang="scss" scoped>
.detail-title {
    font-size: 18px;
    text-align: center;
}
</style>