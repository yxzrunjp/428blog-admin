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
                    <Table ref="tableRef" :dataSource="tableData" :columns="columns" :showPagination="true"
                        :fetch="loadDataList" :options="tableOptions" @rowClick="tableRowClick">
                        <template #cover="{ index, row }">
                            <Cover :src="row.cover"></Cover>
                        </template>
                        <template #op="{ index, row }">
                            <!-- 只能对自己的专题进行操作 -->
                            <div class="tableop" v-if="store.userId === row.userId">
                                <span class="text-click" @click.stop="showEdit('update', row)">修改</span>
                                <el-divider direction="vertical"></el-divider>
                                <span class="text-click" @click.stop="handleDelete(row)">删除</span>
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
                    <div class="special-blog-tree">
                        <el-tree :data="treeData" :props="treeProps" draggable @node-drop="handleNodeDrop">
                            <template #default="{ node, data }">
                                <div class="tree-node">
                                    <div class="node-title">
                                        {{ node.label }}
                                        <span :style="{ fontSize: '12px', color: 'red' }"
                                            v-if="node.data.status === 0">（草稿）</span>
                                    </div>
                                    <div class="node-btns">
                                        <template v-if="node.level === 1">
                                            <span class="text-click" @click.stop="showWindow('add', node)">新增文章</span>
                                        </template>
                                        <template v-else>
                                            <span class="text-click" @click.stop="previewBlog(node.data)">预览</span>
                                            <el-divider direction="vertical"></el-divider>
                                            <template v-if="store.userId === node.data.userId">
                                                <span class="text-click" @click.stop="showWindow('update', node)">修改</span>
                                                <el-divider direction="vertical"></el-divider>
                                            </template>
                                            <template v-if="store.userId === node.data.userId">
                                                <span class="text-click" @click.stop="delTreeItem(node, data)">删除</span>
                                                <el-divider direction="vertical"></el-divider>
                                            </template>
                                            <span class="text-click" @click.stop="showWindow('add', node)">新增下级文章</span>
                                        </template>
                                    </div>
                                </div>
                            </template>
                        </el-tree>
                    </div>
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

        <!-- 编辑博客组件 -->
        <SpecialBlogEdit ref="sepcialBlogEditRef" @closeWindow="closeWindowCB"></SpecialBlogEdit>
        <!-- 预览博客组件 -->
        <SpecialBlogDetail ref="sepcialBlogDetailRef" />
    </div>
</template>

<script setup>
import { reactive, ref, nextTick, getCurrentInstance } from 'vue'
import SpecialBlogEdit from '@/components/SpecialBlogEdit.vue'
import SpecialBlogDetail from '@/components/SpecialBlogDetail.vue'
import { useUserInfoStore } from '@/store/userInfoStore'
const store = useUserInfoStore()
const { proxy } = getCurrentInstance()
const api = {
    loadDataList: '/category/loadCategory4Special',
    saveCategory: '/category/saveCategory4Special',
    delCategory: '/category/delCategory4Special',
    getSpecialInfo: '/blog/getSpecialInfo',
    recoveryBlog: '/blog/recoveryBlog',
    updateSpecialBlogSort: '/blog/updateSpecialBlogSort',
}
// 表格
const tableRef = ref(null)
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
        align: 'center'
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
    // ====== 加载专题文章 =======
    if (tableData?.list?.length) {
        loadSpecial(tableData.list[0].categoryId)
    }
}
const loadSpecial = async (categoryId) => {
    await getSpecialInfo(categoryId)
    nextTick(() => {
        tableRef.value.setCurrentRow('categoryId', categoryId)
    })
}
const tableRowClick = (row) => {
    getSpecialInfo(row.categoryId)
}
// 修改专题事件
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

// ========弹窗相关============
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


// =========表单相关==========
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



// =========专题文章==============
const treeData = reactive([])
const treeProps = {
    children: 'children',
    label: 'title',
    value: 'blogId'
}
// 获取专题文章树
const getSpecialInfo = async (categoryId) => {
    const result = await proxy.Request({
        url: api.getSpecialInfo,
        params: { categoryId, showType: '1' }
    })
    if (!result) {
        return
    }
    Object.assign(treeData, result.data)
}
// 专题文章删除事件
const delTreeItem = (node, data) => {
    console.log(node, data);
    proxy.Confirm(`是否删除${node.label}？`, async () => {
        await deleteBlog(node.data.blogId)
    })
}
// 删除文章
const deleteBlog = async (blogId) => {
    const result = await proxy.Request({
        url: api.recoveryBlog,
        params: {
            blogId
        }
    })
    if (!result)
        return
    loadDataList()
    proxy.Message.success('删除成功')
}

// 预览博客文章事件
const sepcialBlogDetailRef = ref(null)
const previewBlog = async (data) => {
    sepcialBlogDetailRef.value.showDetail(data)
}
// 节点拖拽事件 共四个参数，依次为：被拖拽节点对应的 Node、结束拖拽时最后进入的节点、被拖拽节点的放置位置（before、after、inner）、event
const handleNodeDrop = (node, enterNode, position) => {
    const blogId = node.data.blogId
    let parentNode = null
    if (position === 'inner') {
        // 移入下一级，enterNode为移入后的父节点
        parentNode = enterNode
    } else {
        // 移到上一级，同级排序，enterNode的父节点为操作节点的父节点
        parentNode = enterNode.parent
    }
    const pBlogId = parentNode.data.blogId
    const blogIds = parentNode.childNodes.map(item => {
        return item.data.blogId
    }).join(',')
    sortNode(blogId, pBlogId, blogIds)
}
// 排序
const sortNode = async (blogId, pBlogId, blogIds) => {
    const result = await proxy.Request({
        url: api.updateSpecialBlogSort,
        params: { blogId, pBlogId, blogIds },
        showLoading: false,
    })
    if (!result)
        return
}

// ==========新增，修改 专题文章===========
const sepcialBlogEditRef = ref(null)
const showWindow = (type, node) => {
    const { data } = node
    const { blogId, categoryId } = data
    sepcialBlogEditRef.value.showWindow()
    nextTick(() => {
        if (type === 'update') {
            sepcialBlogEditRef.value.setBlogId('update', blogId, categoryId)
            sepcialBlogEditRef.value.getBlogInfo()
        } else {
            sepcialBlogEditRef.value.setBlogId('add', blogId, categoryId)
        }
    })
}
const closeWindowCB = (categoryId) => {
    loadSpecial(categoryId)
}
</script>

<style lang="scss" scoped>
.special-blog-tree {
    .tree-node {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .node-title {
            margin-right: 10px;
        }
    }
}
</style>