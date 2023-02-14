import { ElMessageBox } from "element-plus"

const confirm = (msg,cb)=>{
    ElMessageBox.confirm(msg,'提示',{confirmButtonText:'确认',cancelButtonText:'取消',type:'info'})
    .then(()=>{
        cb()
    }).catch(()=>{
        // ElMessage({
        //     type:'',
        //     message:'',
        // })
    })
}

export default confirm