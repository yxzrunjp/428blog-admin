<template>
    <div class="sys-info">
        <el-form label-width="200px" :model="formData" :rules="rules" ref="formDataRef">
            <el-form-item label="是否开启评论/留言板" prop="openCommentType">
                <el-radio-group v-model="formData.openCommentType">
                    <el-radio :label="1">是</el-radio>
                    <el-radio :label="0">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <template v-if="formData.openCommentType === 1">
                <el-form-item label="畅言appId" prop="changyanAppId">
                    <el-input v-model="formData.changyanAppId" placeholder="请输入畅言appId" />
                </el-form-item>
                <el-form-item label="畅言appKey" prop="changyanAppKey">
                    <el-input v-model="formData.changyanAppKey" placeholder="请输入畅言appKey" />
                </el-form-item>
            </template>
            <el-form-item label="是否开启Git Pages" prop="gitPagesType">
                <el-radio-group v-model="formData.gitPagesType">
                    <el-radio :label="1">是</el-radio>
                    <el-radio :label="0">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="开启公安备案和IPC备案信息" prop="showIcp">
                <el-radio-group v-model="formData.showIcp">
                    <el-radio :label="1">是</el-radio>
                    <el-radio :label="0">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <template v-if="formData.showIcp === 1">
                <el-form-item label="IPC备案域名" prop="icpDomain">
                    <el-input v-model="formData.icpDomain" placeholder="请输入IPC备案域名" />
                </el-form-item>
                <el-form-item label="IPC备案号" prop="icpNo">
                    <el-input v-model="formData.icpNo" placeholder="请输入IPC备案号" />
                </el-form-item>
                <el-form-item label="公安备案省份" prop="policeProvince">
                    <el-select v-model="formData.policeProvince" clearable showSearch>
                        <el-option v-for="item in provinceList" :label="item" :value="item" :key="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="公安备案号" prop="policeNo">
                    <el-input v-model="formData.policeNo" placeholder="请输入公安备案号" />
                </el-form-item>
            </template>
            <el-form-item label="下载静态页面">
                <span class="text-click" @click="handleDownload">点击下载</span>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleSave">保存</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { reactive, getCurrentInstance, ref } from 'vue';
const { proxy } = getCurrentInstance()
const api = {
    getSysSetting: '/sysSetting/getSysSetting',
    saveSysSetting: '/sysSetting/saveSysSetting',
    createZip: '/sysSetting/createZip',
}
const provinceList = ["京", "津", "冀", "晋", "蒙", "辽", "吉", "黑", "沪", "苏", "浙", "皖", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤", "桂", "琼", "渝", "川", "黔", "滇", "藏", "陕", "甘", "青", "宁", "新", "台", "港", "澳"]
const formDataRef = ref(null)
const formData = reactive({
    openCommentType: 0,
    changyanAppId: '',
    changyanAppKey: '',
    gitPagesType: 0,
    showIcp: 0,
    icpDomain: '',
    icpNo: '',
    policeProvince: '',
    policeNo: '',
})
const rules = reactive({
    openCommentType: [{ required: true, message: '请选择是否开启评论' }],
    changyanAppId: [{ required: true, message: '请输入畅言appId' }],
    changyanAppKey: [{ required: true, message: '请输入畅言appKey' }],
    gitPagesType: [{ required: true, message: '请选择是否开启Git Pages' }],
    showIcp: [{ required: true, message: '请选择是否开启公安备案和IPC备案信息' }],
    icpDomain: [{ required: true, message: '请输入ipc备案域名' }],
    icpNo: [{ required: true, message: '请输入ipc备案号' }],
    policeProvince: [{ required: true, message: '请选择公安备案省份' }],
    policeNo: [{ required: true, message: '请输入公安备案号' }],
})
const resetForm = () => {
    formDataRef.value.resetFields()
}
const handleDownload = () => {
    createZip()
}
const createZip = async () => {
    const result = await proxy.Request({
        url: api.createZip,
    })
    if (!result) {
        return
    }
    document.location.href = "/api/file/download/" + result.data + '/' + encodeURI('静态页面.zip');
}
const handleSave = () => {
    formDataRef.value.validate(v => {
        if (!v) {
            return
        }
        saveSysSetting()
    })
}
const saveSysSetting = async () => {
    const params = {}
    Object.assign(params, formData)
    if(params.openCommentType === 0){
        delete params.changyanAppId
        delete params.changyanAppKey
    }
    if(params.showIcp === 0){
        delete params.icpDomain
        delete params.icpNo
        delete params.policeProvince
        delete params.policeNo
    }
    const result = await proxy.Request({
        url: api.saveSysSetting,
        params
    })
    if (!result)
        return
    proxy.Message.success('保存成功')
    init()
}

const init = () => {
    getSysSetting()
}
const getSysSetting = async () => {
    const result = await proxy.Request({
        url: api.getSysSetting,
    })
    if (!result)
        return
    Object.assign(formData,result.data)
}
init()
</script>

<style lang="scss" scoped>
.sys-info {
    .el-input {
        width: 350px;
    }
}
</style>