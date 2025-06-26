import {createStore} from 'vuex';
import router from "@/router";

export default createStore({
    state: {
        token: sessionStorage.getItem("token"),
        menuList: JSON.parse(sessionStorage.getItem("menuList")),
        userInfo: JSON.parse(sessionStorage.getItem("userInfo"))
    },
    getters: {
        GET_TOKEN: state => {
            return state.token;
        },
        GET_MENULIST: state => {
            return state.menuList;
        },
        GET_USERINFO: state => {
            return state.userInfo;
        }
    },
    mutations: {
        SET_TOKEN: (state, token) => {
            state.token = token;
            sessionStorage.setItem("token", token);
        },
        SET_MENULIST: (state, menuList) => {
            state.menuList = menuList;
            sessionStorage.setItem("menuList", JSON.stringify(menuList));
        },
        SET_USERINFO: (state, userInfo) => {
            state.userInfo = userInfo;
            sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
        }
    },
    actions: {
        // 安全退出
        logout() {
            window.sessionStorage.clear();
            router.replace("/login");
        }
    },
    modules: {}
});
