<template>
    <div class="special-list">
        <el-button :style="{ marginBottom: '10px' }" type="danger" @click="showEdit('add')">新增专题</el-button>
        <el-row :gutter="10">
            <el-col :span="14">
                <el-card>
                    <template #header>
                        <div class="card-title">
                            专题
                        </div>
                    </template>
                    <Table :dataSource="tableData" :columns="columns" :showPagination="true" :fetch="loadDataList"
                        :options="tableOptions">
                        <template #cover="{ index, row }">
                            <Cover :src="row.cover"></Cover>
                        </template>
                        <template #op="{ index, row }">
                            <div class="op">
                                <span class="item" @click="showEdit('update', row)">修改</span>
                                <el-divider direction="vertical"></el-divider>
                                <span class="item" @click="handleDelete(row)">删除</span>
                            </div>
                        </template>
                    </Table>
                </el-card>
            </el-col>
            <el-col :span="10">
                <el-card>
                    <template #header>
                        <div class="card-title">
                            专题文章
                        </div>
                    </template>
                </el-card>
            </el-col>
        </el-row>

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
import { reactive, ref, nextTick, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const api = {
    loadDataList: '/category/loadCategory4Special',
    saveCategory: '/category/saveCategory4Special',
    delCategory: '/category/delCategory4Special',
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
    pageNo: 1,
    pageSize: 15,
    pageTotal: 0,
    totalCount: 1,
})
const tableOptions = {
    extHeight: 135,
}
const loadDataList = async () => {
    let result = await proxy.Request({
        url: api.loadDataList
    })
    if (!result) {
        return
    }
    Object.assign(tableData, result.data)
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
                nextTick(() => {
                    initFormData()
                    // ID重置
                    categoryId.value = ''
                })
                dialogClose()
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
            dialogConfig.title = '新增专题'
        } else if (type === 'update') {
            dialogConfig.title = '编辑专题'
            categoryId.value = data.categoryId
            for (const key in formData) {
                formData[key] = data[key]
            }
        }
    })
}

// 表单相关
const categoryId = ref('')
const formData = reactive({
    categoryName: '',
    cover: '',
    categoryDesc: ''
})
const formDataRef = ref()
const rules = {
    categoryName: [{ required: true, message: "请输入专题名称" }],
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
        if(categoryId.value){
            params.categoryId = categoryId.value
        }
        const result = await proxy.Request({
            url: api.saveCategory,
            params,
        })
        if (!result) {
            return
        }

        // 先重置表单，再关闭窗口
        initFormData()
        // ID重置
        categoryId.value = ''
        nextTick(() => {
            dialogConfig.show = false
        })
        proxy.Message.success('保存成功')
        loadDataList();
    })
}

// 删除专题事件
const handleDelete = ({ categoryId, categoryName }) => {
    proxy.Confirm(`确认删除${categoryName}?`, () => {
        deleteItem(categoryId)
    })
}
// 删除专题
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

</script>

<style lang="scss" scoped>
.blog-category {}
</style>