<template>
    <div class="my-info">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="80">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-form-item label="头像" prop="avatar">
                        <CoverUpload v-model="formData.avatar"></CoverUpload>
                    </el-form-item>
                    <el-form-item label="昵称" prop="nickName">
                        <el-input v-model="formData.nickName" placeholder="请输入昵称" />
                    </el-form-item>
                    <el-form-item label="手机号" prop="phone">
                        <el-input v-model="formData.phone" placeholder="请输入手机号" />
                    </el-form-item>
                    <el-form-item label="密码">
                        <span class="text-click" @click="handleChangePwd">修改密码</span>
                    </el-form-item>
                    <el-form-item label="编辑器" prop="editorType">
                        <el-radio-group v-model="formData.editorType">
                            <el-radio :label="0">富文本编辑器</el-radio>
                            <el-radio :label="1">markdown编辑器</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="职业" prop="profession">
                        <el-input v-model="formData.profession" placeholder="请输入职业" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="saveUserInfo">保存</el-button>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item label="简介" props="introduction">
                        <EditorHtml v-model="formData.introduction"></EditorHtml>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <Dialog :width="'600px'" :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
            @close="dialogClose">
            <el-form label-width="80px" :model="pswFormData" :rules="pswFormRules" ref="pswFormDataRef">
                <el-form-item prop="password" label="密码">
                    <el-input type="password" placeholder="请输入密码" v-model="pswFormData.password">
                    </el-input>
                </el-form-item>
                <el-form-item prop="rePsw" label="重复密码">
                    <el-input type="password" placeholder="请重复输入密码" v-model="pswFormData.rePsw">
                        <!-- type="password"  -->
                    </el-input>
                </el-form-item>
            </el-form>
        </Dialog>
    </div>
</template>

<script setup>
import { reactive, getCurrentInstance, ref, nextTick } from 'vue';
import { useUserInfoStore } from '@/store/userInfoStore'
import cookies from 'vue-cookies'
import { useRouter } from 'vue-router'
import Verify from '@/utils/Verify';
import EditorHtml from '@/components/EditorHtml.vue';
const router = useRouter()
const store = useUserInfoStore()
const { proxy } = getCurrentInstance()
const api = {
    saveMyInfo: '/saveMyInfo',
    updateMyPassword: '/updateMyPassword',
    logout: '/logout',
}

// ===========用户信息==============

const formData = reactive({
    avatar: '',
    nickName: '',
    phone: '',
    editorType: 1,
    introduction: '',
    profession: '',
})
const formRef = ref(null)
const rules = reactive({
    avatar: [{ required: true, message: '请上传头像' }],
    nickName: [{ required: true, message: '请输入昵称' }],
})
const saveUserInfo = () => {
    formRef.value.validate(v => {
        if (!v) {
            return
        }
        submitForm()
    })
}
const submitForm = async () => {
    const params = {}
    Object.assign(params, formData)
    const result = await proxy.Request({
        url: api.saveMyInfo,
        params,
    })
    if (!result)
        return
    proxy.Message.success('保存成功')
    store.$patch({
        ...params
    })
}
const handleChangePwd = () => {
    dialogShow()
}

// ===========修改密码=============
function rePswValidator(rule, value, callback) {
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
        { validator: Verify.password, message: '密码最少8位,只能使用数字和字母和特殊字符', }
    ],
    rePsw: [
        { required: true, message: '请再次输入密码' },
        { validator: rePswValidator, message: '两次输入的密码不一致', }],
})

const dialogConfig = reactive({
    show: false,
    title: '',
    buttons: [
        {
            type: 'danger',
            text: '取消',
            click: (e) => {
                // 隐藏弹窗
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
                pswFormDataRef.value.validate(async (v) => {
                    if (!v) {
                        return
                    }
                    await submitChangePwd()
                    // 隐藏弹窗
                    dialogClose()
                })
            }
        },
    ]
})
const dialogShow = () => {
    dialogConfig.title = '修改密码'
    dialogConfig.show = true
}
const dialogClose = () => {
    resetPwdForm()
    nextTick(() => {
        dialogConfig.show = false
        dialogConfig.title = ''
    })

}
const resetPwdForm = () => {
    pswFormDataRef.value.resetFields()
}
// 修改密码提交
const submitChangePwd = async () => {
    const params = {
        password: pswFormData.password
    }
    const result = await proxy.Request({
        url: api.updateMyPassword,
        params
    })
    if (!result) {
        return
    }
    proxy.Message.success('修改成功,请重新登录')
    setTimeout(() => {
        logout()
    }, 2000)
}
const logout = async () => {
    const result = await proxy.Request({
        url: api.logout
    })
    if (!result) {
        return
    }
    cookies.remove('userInfo')
    cookies.remove('loginInfo')
    store.$reset()
    router.push('/login')
}

// store更新后，获取最新的用户信息
store.$subscribe(() => {
    getUserInfo()
})

const getUserInfo = () => {
    for (const key in formData) {
        formData[key] = store[key]
    }
}
const init = () => {
    getUserInfo()
}
init()

</script>

<style lang="scss" scoped>
.my-info {
    height: 100%;
}
</style>