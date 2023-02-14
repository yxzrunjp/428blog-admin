<template>
    <div class="cover-upload">
        <el-upload name="file" :show-file-list="false" :accept="accept.join(',')" :multiple="false"
            :http-request="uploadImage">
            <div class="add-box">

                <template v-if="modelValue">
                    <img :src="proxy.globalInfo.imageUrl + modelValue" alt="">
                </template>

                <span v-else>+</span>
            </div>

            <!-- 提示信息 -->
            <!-- <template #tip>
                <div class="el-upload__tip">
                    jpg/png files with a size less than 500KB.
                </div>
            </template> -->
        </el-upload>
    </div>
</template>

<script setup>
import { getCurrentInstance,defineEmits } from 'vue';
const { proxy } = getCurrentInstance()
const props = defineProps({
    modelValue: {
        type: String,
        default: null,
    }
})

const api = {
    uploadUrl: '/file/uploadImage'
}
const emit = defineEmits();
const accept = ['.jpg', '.JPG', '.png', '.PNG', '.jpeg', '.JPEG', '.gif', '.GIF', '.bmp', '.BMP']
const uploadImage = async ({ file }) => {
    const result = await proxy.Request({
        params: { file, type: 0 },
        url: api.uploadUrl,
        dataType: 'file'
    })
    if(!result){
        return
    }
    const fileName = result.data.fileName
    emit('update:modelValue',fileName)
}
</script>

<style lang="scss" scoped>
.cover-upload {
    .add-box {
        height: 150px;
        width: 150px;
        background-color: azure;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 40px;

        img {
            width: 100%;
        }
    }
}
</style>