import {createStore} from 'vuex';
import router from "@/router";

export default createStore({
    state: {
        token: sessionStorage.getItem("token"),
        menuList: JSON.parse(sessionStorage.getItem("menuList")),
        userInfo: JSON.parse(sessionStorage.getItem("userInfo")),
        userSelection: [],
        hasRoutes: false,
        editableTabsValue: '/index',
        editableTabs: [
            {
                title: '首页',
                name: '/index'
            }
        ]
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
        },
        GET_USER_SELECTION: state => {
            return state.userSelection;
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
        },
        SET_USER_SELECTION: (state, selection) => {
            state.userSelection.push(selection);
        },
        SET_ROUTES_STATE: (state, hasRoutes) => {
            state.hasRoutes = hasRoutes;
        },
        ADD_TABS: (state, tab) => {
            if (state.editableTabs.findIndex(e => e.name === tab.path) === -1) {
                state.editableTabs.push({
                    title: tab.name,
                    name: tab.path
                });
            }
            state.editableTabsValue = tab.path;
        },
        RESET_TABS: (state) => {
            state.editableTabsValue = '/index';
            state.editableTabs = [
                {
                    title: '首页',
                    name: '/index'
                }
            ];
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
