<template>
    <div class="team-user">
        <div class="top">
            <el-form :model="searchFormData">
                <el-row :gutter="10">
                    <el-col :span="6">
                        <el-form-item prop="nickNameFuzzy" label="昵称">
                            <el-input placeholder="请输入昵称" v-model="searchFormData.nickNameFuzzy" clearable>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item prop="phoneFuzzy" label="手机号">
                            <el-input placeholder="请输入手机号" v-model="searchFormData.phoneFuzzy" clearable>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                        <el-button type="primary" @click="handleMember('add')">新增成员</el-button>
                    </el-col>
                </el-row>
            </el-form>
        </div>
        <div class="table-box">
            <Table :dataSource="tableData" :columns="columns" :showPagination="true" :fetch="loadDataList"
                :options="tableOptions">
                <template #avatar="{ index, row }">
                    <Cover :src="row.avatar"></Cover>
                </template>
                <template #userInfo="{ index, row }">
                    <div>昵称：{{ row.nickName }}</div>
                    <div>手机号：{{ row.phone }}</div>
                    <div>职业：{{ row.profession }}</div>
                </template>

                <template #editorType="{ index, row }">
                    <span v-if="row.editorType === 1">
                        markdown编辑器
                    </span>
                    <span v-else>
                        富文本编辑器
                    </span>
                </template>
                <template #status="{ index, row }">
                    <span :style="{ color: 'red' }" v-if="row.status === 0">{{ row.statusName }}</span>
                    <span :style="{ color: 'green' }" v-else>{{ row.statusName }}</span>
                </template>
                <template #time="{ index, row }">
                    <div>创建时间：{{ row.createTime }}</div>
                    <div>上一次登录时间：{{ row.lastLoginTime || '无记录' }}</div>
                </template>
                <template #op="{ index, row }">
                    <div class="tableop">
                        <span class="text-click" @click="handleMember('update', row)">修改信息</span>
                        <el-divider direction="vertical"></el-divider>
                        <!-- row.status === 1 已启用，点击则禁用 -->
                        <span v-if="row.status === 1" class="text-click" @click="handleForbit(row)">禁用</span>
                        <!-- row.status === 0 已禁用，点击则启用 -->
                        <span v-else class="text-click" @click="handleForbit(row)">启用</span>
                        <el-divider direction="vertical"></el-divider>
                        <template v-if="store.userId !== row.userId">
                            <span class="text-click" @click="handlePsw(row)">修改密码</span>
                            <el-divider direction="vertical"></el-divider>
                        </template>
                        <span class="text-click" @click="handleDelete(row)">删除</span>
                    </div>
                </template>
            </Table>
        </div>
        <!-- 添加成员/修改信息 -->
        <Dialog :width="'900px'" :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
            @close="dialogClose">
            <el-form label-width="110px" :model="dialogFormData" :rules="dialogFormRules" ref="dialogFormRef">
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item prop="nickName" label="昵称">
                            <el-input placeholder="请输入昵称" v-model="dialogFormData.nickName">
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="phone" label="手机号">
                            <el-input placeholder="请输入手机号" v-model="dialogFormData.phone">
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10" v-if="dialogType === 'add'">
                    <el-col :span="12">
                        <el-form-item prop="password" label="密码">
                            <el-input type="password" placeholder="请输入密码" v-model="dialogFormData.password">
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="rePsw" label="再次输入密码">
                            <el-input type="password" placeholder="请再次输入密码" v-model="dialogFormData.rePsw">
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item prop="editorType" label="默认编辑器">
                            <el-radio-group v-model="dialogFormData.editorType">
                                <el-radio :label="0">富文本编辑器</el-radio>
                                <el-radio :label="1">markdown编辑器</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="profession" label="职业">
                            <el-input placeholder="请输入职业" v-model="dialogFormData.profession">
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-form-item prop="avatar" label="头像">
                        <CoverUpload v-model="dialogFormData.avatar"></CoverUpload>
                    </el-form-item>
                </el-row>
                <el-row>
                    <el-form-item prop="introduction" label="简介">
                        <EditorHtml v-model="dialogFormData.introduction" :editorHeight="400"></EditorHtml>
                    </el-form-item>
                </el-row>
            </el-form>
        </Dialog>

        <!-- 修改密码 -->
        <Dialog :width="'600px'" :show="pswDialogConfig.show" :title="pswDialogConfig.title"
            :buttons="pswDialogConfig.buttons" @close="pswDialogClose">
            <el-form label-width="80px" :model="pswFormData" :rules="pswFormRules" ref="pswFormDataRef">
                <el-form-item prop="password" label="密码">
                    <el-input type="password" placeholder="请输入密码" v-model="pswFormData.password">
                    </el-input>
                </el-form-item>
                <el-form-item prop="rePsw" label="重复密码">
                    <el-input type="password" placeholder="请再次输入密码" v-model="pswFormData.rePsw">
                    </el-input>
                </el-form-item>
            </el-form>
        </Dialog>
    </div>
</template>

<script setup>
import { reactive, getCurrentInstance, ref, nextTick } from 'vue';
import { useUserInfoStore } from '@/store/userInfoStore'
const store = useUserInfoStore()
const { proxy } = getCurrentInstance()
const api = {
    loadUser: '/setting/loadUser',
    updateStatus: '/setting/updateStatus',
    delUser: '/setting/delUser',
    saveTeamUser: '/setting/saveTeamUser',
    updatePassword: '/setting/updatePassword'
}
// =============表单===========
const searchFormData = reactive({
    nickNameFuzzy: '',
    phoneFuzzy: '',
})
const handleSearch = () => {
    loadDataList()
}
const handleMember = (type, memberInfo) => {
    dialogShow()
    dialogType.value = type
    nextTick(() => {
        if (type === 'update') {
            dialogConfig.title = '修改信息'
            // 记录操作的用户ID
            userId.value = memberInfo.userId
            setDialogForm(memberInfo)
        } else {
            dialogConfig.title = '新增成员'
        }
    })
}
// 修改成员状态事件
const handleForbit = ({ userId, status }) => {
    updateStatus(userId, status)
}
const updateStatus = async (userId, status) => {
    const params = { userId }
    const newStatus = status === 1 ? 0 : 1
    params.status = newStatus
    const result = await proxy.Request({
        url: api.updateStatus,
        params
    })
    if (!result) {
        return
    }

    loadDataList()
}
// 删除成员事件
const handleDelete = ({ userId, nickName }) => {
    proxy.Confirm(`确认删除：${nickName}？`, () => {
        delUser(userId)
    })
}
const delUser = async (userId) => {
    const params = { userId }
    const result = await proxy.Request({
        url: api.delUser,
        params
    })
    if (!result) {
        return
    }
    loadDataList()
}
// 修改密码事件
const handlePsw = async (row) => {
    userId.value = row.userId
    pswDialogShow()
}
// ==============表格=============
const columns = reactive([
    {
        label: '头像',
        prop: 'avatar',
        width: 100,
        scopedSlots: 'avatar',
    },
    {
        label: '用户信息',
        prop: 'userInfo',
        scopedSlots: 'userInfo',
    },
    {
        label: '默认编辑器',
        prop: 'editorType',
        width: 150,
        scopedSlots: 'editorType',
    },
    {
        label: '角色',
        prop: 'roleTypeName',
        width: 100,
    },
    {
        label: '状态',
        prop: 'status',
        width: 100,
        scopedSlots: 'status',
    },
    {
        label: '时间',
        prop: 'time',
        width: 300,
        scopedSlots: 'time',
    },
    {
        label: '操作',
        prop: 'op',
        width: 300,
        scopedSlots: 'op',
    },
])
const tableOptions = {
    extHeight: 50,
}
const tableData = reactive({
    list: [],
    pageNo: 1,
    pageSize: 15,
    totalCount: 0,
    pageTotal: 1,
})

const loadDataList = async () => {
    const params = {}
    Object.assign(params, searchFormData)
    params.pageNo = tableData.pageNo
    params.pageSize = tableData.pageSize
    const result = await proxy.Request({
        url: api.loadUser,
        params,
    })
    if (!result) {
        return
    }
    Object.assign(tableData, result.data)
}

// ============修改信息弹窗==============
const dialogType = ref('add')//add:当前弹窗用于添加成员，update：当前弹窗用于修改信息
const userId = ref('')

const dialogFormRef = ref(null)
function rePswValidator(rule, value, callback) {
    if (value) {
        if (value !== dialogFormData.password) {
            callback(new Error(rule.message))
        } else {
            callback()
        }
    } else {
        callback(new Error())
    }
}
const dialogFormRules = reactive({
    nickName: [{ required: true, message: '请输入昵称' }],
    phone: [
        { required: true, message: '请输入手机号' },
        { validator: proxy.Verify.phone, message: '手机号格式不正确' }
    ],
    password: [
        { required: true, message: '请输入密码' },
    ],
    rePsw: [
        { required: true, message: '请再次输入密码' },
        { validator: rePswValidator, message: '两次输入的密码不一致', },
    ],
    editorType: [{ required: true, message: '请选择默认编辑器' }],
})
const dialogFormData = reactive({
    nickName: '',
    phone: '',
    password: '',
    editorType: 0,
    profession: '',
    avatar: '',
    introduction: '',
})
const dialogConfig = reactive({
    show: false,
    title: '',
    buttons: [{
        type: 'danger',
        text: '取消',
        click: (e) => {
            resetDialogForm()
            nextTick(() => {
                dialogClose()
            })
        }
    },
    {
        type: 'primary',
        text: '确认',
        click: (e) => {
            dialogFormRef.value.validate(v => {
                if (!v) {
                    return
                }
                submitForm()
            })
        }
    }],
})
const dialogClose = () => {
    dialogConfig.show = false
    dialogConfig.title = ''
}
const dialogShow = () => {
    dialogConfig.show = true
}
const resetDialogForm = () => {
    dialogFormRef.value.resetFields()
    userId.value = ''
    dialogType.value = 'add'
}
const setDialogForm = (data) => {
    for (const key in dialogFormData) {
        dialogFormData[key] = data[key]
    }
}

const submitForm = async () => {
    const params = {}
    Object.assign(params, dialogFormData)
    if (userId.value) {
        params.userId = userId.value
    }
    if (dialogType.value === 'update') {
        // 删掉密码选项
        delete params.password
        delete params.rePsw
    }
    const result = await proxy.Request({
        url: api.saveTeamUser,
        params
    })
    if (!result) {
        return
    }
    proxy.Message.success('保存成功')
    resetDialogForm()
    nextTick(() => {
        dialogClose()
        loadDataList()
    })
}

// ===========修改密码=============
function updatePswValidator(rule, value, callback) {
    if (value) {
        if (value !== pswFormData.password) {
            callback(new Error(rule.message))
        } else {
            callback()
        }
    } else {
        callback(new Error())
    }
}
const pswFormData = reactive({
    password: '',
    rePsw: '',
})
const pswFormDataRef = ref(null)
const pswFormRules = reactive({
    password: [
        { required: true, message: '请输入密码' },
        { min: 8, message: '请输入至少8位', trigger: 'blur' },
        { validator: proxy.Verify.password, message: '密码最少8位,只能使用数字和字母和特殊字符', }
    ],
    rePsw: [
        { required: true, message: '请再次输入密码' },
        { validator: updatePswValidator, message: '两次输入的密码不一致', }],
})

const pswDialogConfig = reactive({
    show: false,
    title: '',
    buttons: [
        {
            type: 'danger',
            text: '取消',
            click: (e) => {
                // 隐藏弹窗
                resetPwdForm()
                nextTick(() => {
                    pswDialogClose()
                })
            }
        },
        {
            type: 'primary',
            text: '确定',
            click: (e) => {
                // 提交表单
                pswFormDataRef.value.validate(async (v) => {
                    if (!v) {
                        return
                    }
                    await submitChangePwd()
                })
            }
        },
    ]
})
const pswDialogShow = () => {
    pswDialogConfig.title = '修改密码'
    pswDialogConfig.show = true
}
const pswDialogClose = () => {
    resetPwdForm()
    nextTick(() => {
        pswDialogConfig.show = false
        pswDialogConfig.title = ''
    })

}
const resetPwdForm = () => {
    pswFormDataRef.value.resetFields()
    userId.value = ''
}
// 修改密码提交
const submitChangePwd = async () => {
    const params = {
        password: pswFormData.password,
        userId: userId.value
    }
    const result = await proxy.Request({
        url: api.updatePassword,
        params
    })
    if (!result) {
        return
    }
    proxy.Message.success('修改成功')
    resetPwdForm()
    nextTick(() => {
        pswDialogClose()
    })
}

</script>

<style lang="scss" scoped>
.team-user {
    .top {}
}
</style>