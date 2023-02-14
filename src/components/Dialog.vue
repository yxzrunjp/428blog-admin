<template>
    <div>
        <!-- :show-close="true" -->
        <el-dialog 
          :show-close="false"
          :draggable="true"
          :model-value="show"
          :close-on-click-model="false"
          :close-on-press-escape="false"
          :before-close="beforeClose"
          :title="title"
          class="custom-dialog"
          :top="top"
          :width="width"
          >
          <div class="dialog-body">
            <slot></slot>
          </div>
          <div class="btn-box">
              <!-- <el-button type="danger" @click="handleCancel">取消</el-button> -->
              <template v-if="buttons.length>0">
                <el-button v-for="item in buttons" :type="item.type" @click="item.click">{{ item.text }}</el-button>
              </template>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
    show:{
        type:Boolean,
        default:false,
    },
    title:{
        type:String,
        default:'',
    },
    showClose:{
        type:Boolean,
        default:true,
    },
    top:{
        type:String,
        default:'50px'
    },
    width:{
        type:String,
        default:'30%'
    },
    buttons:{
        type:Array,
        default:()=>{return []},
    }
})


const emit = defineEmits(['close'])
const beforeClose = (done)=>{
    emit('close')
    done()
}
</script>

<style lang="scss" scoped>
:deep(.custom-dialog){
    .el-dialog__body{
        border-top: 1px solid rgb(66, 63, 63);
    }
    .dialog-body{
        margin-bottom: 10px;
    }
    .btn-box{
        display: flex;
        align-items: center;
        justify-content: flex-end;
        // border-top: 1px solid rgb(66, 63, 63);
    }
}
</style>