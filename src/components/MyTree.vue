<template>
    <div class="special-blog-tree">
        <el-tree :data="treeData" :props="treeProps" :draggable="draggable" @node-drop="handleNodeDrop">
            <template #default="{ node, data }">
                <div class="tree-node">
                    <div class="node-title">
                        {{ node.label }}
                        <span :style="{ fontSize: '12px', color: 'red' }" v-if="node.data.status === 0">（草稿）</span>
                    </div>
                    <div v-if="showOptions" class="node-btns">
                        <template v-if="node.level === 1">
                            <span class="node-btn" @click.stop="showWindow('add', node)">新增文章</span>
                        </template>
                        <template v-else>
                            <span class="node-btn" @click.stop="previewBlog(node.data)">预览</span>
                            <el-divider direction="vertical"></el-divider>
                            <span class="node-btn" @click.stop="showWindow('update', node)">修改</span>
                            <el-divider direction="vertical"></el-divider>
                            <span class="node-btn" @click.stop="delTreeItem(node, data)">删除</span>
                            <el-divider direction="vertical"></el-divider>
                            <span class="node-btn" @click.stop="showWindow('add', node)">新增下级文章</span>
                        </template>
                    </div>
                </div>
            </template>
        </el-tree>
    </div>
</template>

<script setup>
import { reactive } from 'vue';

const data = reactive([{
    label: 'Level one 1',
    children: [
        {
            label: 'Level two 1-1',
            children: [
                {
                    label: 'Level three 1-1-1',
                },
            ],
        },
    ],
}])
const treeProps = {
    children: 'children',
    label: 'label',
}
const props = defineProps({
    draggable: {
        type: Boolean,
        default: false,
    },
    showOptions: {
        type: Boolean,
        default: false,
    },
    treeData:{
        type:Array,
        // default:()=>{
        //     return []
        // }
    },
    treeProps:{
        type:Object,
        // default:()=>{
        //     return {}
        // }
    }
})
const emit = defineEmits(['handleNodeDrop', 'previewBlog', 'showWindow', 'delTreeItem'])
const handleNodeDrop = (...args) => {
    emit('handleNodeDrop', ...args)
}
const previewBlog = (...args) => {
    emit('handleNodeDrop', ...args)
}
const showWindow = (...args) => {
    emit('showWindow', ...args)
}
const delTreeItem = (...args) => {
    emit('delTreeItem', ...args)
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

        .node-btns {
            .node-btn {
                color: rgb(112, 106, 178);
                font-size: 12px;

                &:hover {
                    text-decoration: underline;
                }
            }
        }

    }
}
</style>