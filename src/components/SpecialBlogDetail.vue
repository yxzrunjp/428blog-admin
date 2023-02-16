<template>
    <Window v-if="windowConfig.show" :buttons="windowConfig.buttons">
        <el-row :style="{ height: '100%',overflowY:'scroll'}" :gutter="10">
            <el-col :span="6">
                <el-card>
                    <template #header>
                        <div class="detail-title">
                            专题文章
                        </div>
                    </template>
                    <div class="special-blog-tree">
                        <el-tree :highlight-current="true" ref="treeRef" :data="treeData" :props="treeProps" @node-click="nodeClick" node-key="blogId">
                            <template #default="{ node, data }">
                                <div class="tree-node">
                                    <div class="node-title">
                                        {{ node.label }}
                                        <span :style="{ fontSize: '12px', color: 'red' }"
                                            v-if="node.data.status === 0">（草稿）</span>
                                    </div>
                                </div>
                            </template>
                        </el-tree>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="18">
                <el-card>
                    <template #header>
                        <div class="detail-title">
                            {{ blog.title }}
                        </div>
                    </template>
                    <!-- <div v-html="blog.content"></div> -->
                    <v-md-preview-html :html="blog.content" preview-class="github-markdown-body"></v-md-preview-html>
                </el-card>
            </el-col>
        </el-row>
    </Window>
</template>

<script setup>
import { reactive, getCurrentInstance, nextTick,ref } from 'vue';

const { proxy } = getCurrentInstance()
const api = {
    getBlogById: '/blog/getBlogById',
    getSpecialInfo: '/blog/getSpecialInfo',
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
}
const showDetail = async (data) => {
    windowConfig.show = true
    await getDetail(data.blogId)
    await getSpecialInfo(data.categoryId,data)
    nextTick(()=>{
        treeRef.value.setCurrentKey(data.blogId)
    })

}
const closeDetail = () => {
    windowConfig.show = false
}

const treeData = reactive([])
const treeProps = {
    children: 'children',
    label: 'title',
    value: 'blogId'
}
const treeRef = ref(null)
const nodeClick = (data) => {
    getDetail(data.blogId)
}
// 获取专题文章树
const getSpecialInfo = async (categoryId,data) => {
    const result = await proxy.Request({
        url: api.getSpecialInfo,
        params: { categoryId, showType: '1' }
    })
    if (!result) {
        return
    }
    Object.assign(treeData, result.data)
}

defineExpose({ showDetail })
</script>

<style lang="scss" scoped>
.detail-title {
    font-size: 18px;
    text-align: center;
}
</style>