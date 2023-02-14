<template>
    <div class="test">
        <!-- <EditorMarkdown v-model="md" @htmlContentChange="htmlChange"></EditorMarkdown> -->
        <EditorHtml v-model="md"></EditorHtml>
        {{ md }}
    </div>
</template>

<script setup>
import { ref } from 'vue';

const md = ref('aaasd')
const html = ref('')
setTimeout(()=>{
    md.value = '1111'
},2000)
const htmlChange = (h)=>{
    html.value = html
}
</script>

<style lang="scss" scoped>

</style>