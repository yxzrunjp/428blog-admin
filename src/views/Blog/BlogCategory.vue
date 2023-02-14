<template>
    <div class="blog-category">
        <el-button type="danger" @click="showEdit('add')">新增分类</el-button>
        <Table :dataSource="tableData" :columns="columns" :showPagination="false" :fetch="loadDataList"
            :options="tableOptions">
            <template #cover="{ index, row }">
                <Cover :src="row.cover"></Cover>
            </template>
            <template #op="{ index, row }">
                <div class="op">
                    <span class="item" @click="showEdit('update', row)">修改</span>
                    <el-divider direction="vertical"></el-divider>
                    <span class="item" @click="handleDelete(row)">删除</span>
                    <el-divider direction="vertical"></el-divider>
                    <span :class="[index === 0 ? 'disable' : 'item']" @click="changeSort(index, 'up')">上移</span>
                    <el-divider direction="vertical"></el-divider>
                    <span :class="[index === tableLastIndex ? 'disable' : 'item']"
                        @click="changeSort(index, 'down')">下移</span>
                </div>
            </template>
        </Table>
        <Dialog :width="'500px'" :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
            @close="dialogClose">
            <el-form label-width="60px" :model="formData" :rules="rules" ref="formDataRef">
                <el-form-item prop="categoryName" label="名称">
                    <el-input placeholder="请输入名称" v-model="formData.categoryName">
                    </el-input>
                </el-form-item>

                <el-form-item prop="cover" label="封面">
                    <CoverUpload v-model="formData.cover"></CoverUpload>
                </el-form-item>

                <el-form-item prop="categoryDesc" label="简介">
                    <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 4 }" placeholder="请输入简介"
                        v-model="formData.categoryDesc">
                    </el-input>
                </el-form-item>

            </el-form>
        </Dialog>
    </div>
</template>

<script setup>
import { reactive, ref, nextTick, getCurrentInstance, computed, toRaw } from 'vue'
const { proxy } = getCurrentInstance()
const api = {
    loadDataList: '/category/loadAllCategory4Blog',
    saveCategory: '/category/saveCategory4Blog',
    delCategory: '/category/delCategory4Blog',
    changeCategorySort: '/category/changeCategorySort4Blog',
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
        label: '名称',
        prop: 'categoryName',
        width: 200
    },
    {
        label: '简介',
        prop: 'categoryDesc',
    },
    {
        label: '博客数量',
        prop: 'blogCount',
        width: 100,
    },
    {
        label: '操作',
        prop: 'op',
        width: 200,
        scopedSlots: 'op',
    },
]
const tableData = reactive({
    list: [],
})
const tableOptions = {
    extHeight: 10,
}
const categoryId = ref('')
const loadDataList = async () => {
    let result = await proxy.Request({
        url: api.loadDataList
    })
    if (!result) {
        return
    }
    tableData.list = result.data
}

// 弹窗相关
const dialogConfig = reactive({
    show: false,
    title: '标题',//标题
    buttons: [
        {
            type: 'danger',
            text: '取消',
            click: (e) => {

                initFormData()
                categoryId.value = ''
                nextTick(() => {
                    dialogClose()
                })
            }
        },
        {
            type: 'primary',
            text: '确定',
            click: (e) => {
                // 提交表单
                submitForm()
            }
        },
    ],//按钮集合

})
const dialogClose = () => {
    dialogConfig.title = ''
    dialogConfig.show = false
}
const showEdit = (type, data) => {
    dialogConfig.show = true
    nextTick(() => {
        if (type === 'add') {
            dialogConfig.title = '新增分类'
        } else if (type === 'update') {
            dialogConfig.title = '编辑分类'
            // Object.assign(formData, data)
            for (const key in formData) {
                formData[key] = data[key]
            }
            categoryId.value = data.categoryId
        }
    })

}

// 表单相关
const formData = reactive({
    categoryName: '',
    cover: '',
    categoryDesc: '',
})
const formDataRef = ref()
const rules = {
    categoryName: [{ required: true, message: "请输入分类名称" }],
}
// 重置表单
const initFormData = () => {
    formDataRef.value.resetFields()
}
// 提交表单
const submitForm = () => {
    formDataRef.value.validate(async valid => {
        if (!valid) {
            return
        }
        let params = {}
        Object.assign(params, formData)
        if (categoryId.value) {
            params.categoryId = categoryId.value
        }
        const result = await proxy.Request({
            url: api.saveCategory,
            params,
        })
        if (!result) {
            return
        }
        initFormData()
        categoryId.value = ''
        nextTick(() => {
            dialogConfig.show = false
        })
        proxy.Message.success('保存成功')
        loadDataList();
    })
}

// 删除分类事件
const handleDelete = ({ categoryId, categoryName }) => {
    proxy.Confirm(`确认删除${categoryName}?`, () => {
        deleteItem(categoryId)
    })
}
// 删除分类
const deleteItem = async (categoryId) => {
    const result = await proxy.Request({
        url: api.delCategory,
        params: {
            categoryId
        }
    })
    if (!result) {
        return
    }
    proxy.Message.success('删除成功')
    // 刷新数据
    loadDataList()
}

// 

const tableLastIndex = computed(() => {
    return tableData.list.length - 1
})
const changeSort = async (index, type) => {
    const tableList = JSON.parse(JSON.stringify(tableData.list))
    if (type === 'up' && index === 0 || type === 'down' && index === tableLastIndex.value) {
        return
    }
    const temp = tableList[index]
    const number = type === 'down' ? 1 : -1
    tableList[index] = tableList[index + number]
    tableList[index + number] = temp
    // tableList.splice(index,1)
    // tableList.splice(index+number,0,temp)
    const result = await proxy.Request({
        url: api.changeCategorySort,
        dataType: 'json',
        params: tableList
    })
    if (!result) {
        return
    }
    loadDataList()
}

</script>

<style lang="scss" scoped>
.blog-category {}
</style>