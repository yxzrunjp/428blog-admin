<template>
    <Window v-if="windowConfig.show" :buttons="windowConfig.buttons">
        <div class="detail-title">{{ blog.title }}</div>
        <!-- <div v-html="blog.content"></div> -->
        <v-md-preview-html :html="blog.content" preview-class="github-markdown-body"></v-md-preview-html>
    </Window>
</template>

<script setup>
import { reactive, getCurrentInstance, nextTick,} from 'vue';

const { proxy } = getCurrentInstance()
const api = {
    getBlogById: '/blog/getBlogById',
}
const blog = reactive({})
const windowConfig = reactive({
    show: false,
    buttons: [{
        type:'primary',
        text:'返回',
        click:()=>{
            closeDetail()
        }
    }],
})
const getDetail = async (blogId)=>{
    const result = await proxy.Request({
        url:api.getBlogById,
        params:{blogId}
    })
    if(!result){
        return
    }
    Object.assign(blog,result.data)
}
const showDetail = (blogId) => {
    windowConfig.show = true
    console.log(blogId);
    getDetail(blogId)
}
const closeDetail = ()=>{
    windowConfig.show = false
}

defineExpose({ showDetail })
</script>

<style lang="scss" scoped>
.detail-title{
    font-size: 18px;
    text-align: center;
}
</style>