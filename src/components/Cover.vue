<template>
    <div class="cover">
        <img :src="proxy.globalInfo.imageUrl+src" v-if="src">
        <span v-else>暂无封面</span>
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
    src: {
        type: String,
        default: ''
    }
})

</script>

<style lang="scss" scoped>
.cover {
    font-size: 12px;
    background-color: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 80px;
    overflow: hidden;
    img {
        width: 100%;
    }
}
</style>