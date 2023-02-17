const reg ={
    phone:/^((1[0-9]))\d{9}$/,
    password:/^\w+$/,
}
const verify = (rule,value,reg,callback)=>{
    if(value){
        if(reg.test(value)){
            callback()
        }else{
            callback(new Error(rule.message))
        }
    }else{
        callback(new Error('请输入值'))
    }
}

export default {
    phone:(rule,value,callback)=>{
        return verify(rule,value,reg.phone,callback)
    },
    password:(rule,value,callback)=>{
        return verify(rule,value,reg.password,callback)
    },

}