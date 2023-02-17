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
                        <a href="#" @click.prevent="() => { }">修改密码</a>
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
                    <el-form-item props="introduction">
                        <EditorHtml v-model="formData.introduction"></EditorHtml>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script setup>
import { reactive, getCurrentInstance, ref } from 'vue';
const { proxy } = getCurrentInstance()
const api = {
    getUserInfo: '/getUserInfo',
    saveMyInfo: '/saveMyInfo',
}
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
    nickName: [{required: true, message:'请输入昵称' }],
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
    init()
}

const init = async () => {
    await getUserInfo()
}
const getUserInfo = async () => {
    const result = await proxy.Request({
        url: api.getUserInfo,
    })
    if (!result) {
        return
    }
    for (const key in formData) {
        formData[key] = result.data[key]
    }
}
init()
</script>

<style lang="scss" scoped>
.my-info {
    height: 100%;
}
</style>