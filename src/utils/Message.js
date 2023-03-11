// import { ElMessage } from 'element-plus'

const duration = 2000;
const message = {
    error:(msg)=>{
        ElMessage({
            message:msg,
            type:'error',
            duration,
        })
    },
    success:(msg)=>{
        ElMessage({
            message:msg,
            type:'success',
            duration,
        })
    },
    warning:(msg)=>{
        ElMessage({
            message:msg,
            type:'warning',
            duration,
        })
    },

}

export default message