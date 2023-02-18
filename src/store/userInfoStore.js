import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore('userInfo', {
    state: () => {
        return {
            avatar: '',
            createTime: '',
            editorType: null,
            editorTypeName: '',
            introduction: '',
            lastLoginTime: '',
            nickName: '',
            phone: '',
            profession: '',
            roleType: null,
            roleTypeName: '',
            status: null,
            statusName: '',
            userId: null,
        }
    }
})