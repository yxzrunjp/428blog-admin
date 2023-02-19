<template>
    <div class="recover-list">
        <el-form :model="formData">
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-form-item prop="titleFuzzy" label="标题">
                        <el-input v-model="formData.titleFuzzy" />
                    </el-form-item>
                </el-col>
                <el-col :span="6"><el-button type="danger" @click="handleSearch">搜索</el-button></el-col>
            </el-row>
        </el-form>
        <Table :dataSource="tableData" :columns="columns" :showPagination="true" :fetch="loadDataList"
            :options="tableOptions">
            <template #cover="{ index, row }">
                <Cover :src="row.cover"></Cover>
            </template>
            <template #info="{ index, row }">
                <div>标题：{{ row.title }}</div>
                <div>
                    文章类型：{{ row.blogType === 0 ? '博客' : '专题' }}<el-divider direction="vertical" />
                    <span>{{ row.blogType === 0 ? '分类' : '专题' }}：{{ row.categoryName }}</span>
                </div>
                <div>作者：{{ row.nickName }}</div>
            </template>

            <template #time="{ index, row }">
                <div>创建时间：{{ row.createTime }}</div>
                <div>更新时间：{{ row.lastUpdateTime || '无记录' }}</div>
            </template>
            <template #op="{ index, row }">
                <div class="tableop">
                    <span class="text-click" @click="handleRecover(row)">还原</span>
                    <el-divider direction="vertical"></el-divider>
                    <span class="text-click" @click="handleDelete(row)">删除</span>
                </div>
            </template>
        </Table>
    </div>
</template>

<script setup>
import { reactive, ref, getCurrentInstance, } from 'vue'
const { proxy } = getCurrentInstance()
const api = {
    loadRecoveryList: '/blog/loadRecoveryList',
    reductionBlog: '/blog/reductionBlog',
    delBlog: '/blog/delBlog',
}

// 表格
const columns = [
    {
        label: '封面',
        prop: 'cover',
        width: 100,
        scopedSlots: 'cover',
    },
    {
        label: '文章信息',
        prop: 'info',
        scopedSlots: 'info'
    },
    {
        label: '编辑器',
        prop: 'editorTypeName',
        width: 100,
    },
    {
        label: '评论',
        prop: 'allowCommentTypeName',
        width: 100,
    },
    {
        label: '时间',
        prop: 'time',
        width: 240,
        scopedSlots: 'time'
    },
    {
        label: '操作',
        prop: 'op',
        width: 180,
        scopedSlots: 'op',
        align: 'center'
    },
]
const tableData = reactive({
    list: [],
    pageNo: 1,
    pageSize: 15,
    pageTotal: 0,
    totalCount: 0,
})
const tableOptions = {
    extHeight: 50,
}
const loadDataList = async () => {
    const params = {
        titleFuzzy: formData.titleFuzzy,
        pageNo: tableData.pageNo,
        pageSize: tableData.pageSize
    }
    let result = await proxy.Request({
        url: api.loadRecoveryList,
        params,
    })
    if (!result) {
        return
    }
    Object.assign(tableData, result.data)
}


// 表单相关
const formData = reactive({
    titleFuzzy: '',
})
// 搜索事件
const handleSearch = () => {
    loadDataList()
}
// 还原事件
const handleRecover = ({ blogId, title }) => {
    proxy.Confirm(`确定还原：${title}?`, () => {
        reductionBlog(blogId)
    })
}
const reductionBlog = async (blogId) => {
    const result = await proxy.Request({
        url: api.reductionBlog,
        params: { blogId }
    })
    if (!result) {
        return
    }
    proxy.Message.success('还原成功')
    loadDataList()
}
// 删除事件
const handleDelete = ({ blogId, title }) => {
    proxy.Confirm(`确定彻底删除：${title}?`, () => {
        delBlog(blogId)
    })
}
const delBlog = async (blogId) => {
    const result = await proxy.Request({
        url: api.delBlog,
        params: { blogId }
    })
    if (!result) {
        return
    }
    proxy.Message.success('删除成功')
    loadDataList()
}

</script>

<style lang="scss" scoped></style>