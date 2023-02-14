<template>
    <!-- v-if="show"  -->
    <div class="window-box" :style="{ width: width + 'px' }">
        <div class="title">
            <span>《</span>
        </div>
        <div class="body">
            <slot></slot>
        </div>
        <div class="footer">
            <el-button v-for="item in buttons" :type="item.type" @click="item.click">{{ item.text }}</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onUpdated, onUnmounted, onBeforeMount, onBeforeUpdate } from 'vue';

// 250px导航栏,margin-right 15px
const width = ref(window.innerWidth - 265)
const resizeWidth = (e) => {
    console.log(e);
    width.value = window.innerWidth - 265
}

onBeforeMount(() => {
    console.log(`onBeforeMount`);
})
onMounted(() => {
    console.log(`onMounted`);
    window.addEventListener('resize', resizeWidth)
})

onBeforeUpdate(() => {
    console.log(`onBeforeUpdate`);
})
onUpdated(() => {
    console.log(`onUpdated`);
})


onBeforeUnmount(() => {
    console.log(`onBeforeUnmount`);
    window.removeEventListener('resize', resizeWidth)
})
onUnmounted(() => {
    console.log(`onUnmounted`);
})

const props = defineProps({
    // show: {
    //     type: Boolean,
    //     default: false,
    // },
    buttons: {
        type: Array,
        default: () => {
            return []
        }
    },
})
</script>

<style lang="scss" scoped>
.window-box {
    position: absolute;
    top: 0;
    left: 0;
    // 60px 头部，10px间隔
    height: calc(100vh - 70px);
    // background-color: pink;
    background-color: #fff;
    padding: 10px;
    z-index: 50;

    .title {
        height: 30px;
        display: flex;
        align-items: center;
    }

    .body {
        height: calc(100% - 80px);
    }

    .footer {
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>