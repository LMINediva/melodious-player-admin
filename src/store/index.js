import {createStore} from 'vuex';

export default createStore({
    state: {
        token: sessionStorage.getItem("token"),
        menuList: JSON.parse(sessionStorage.getItem("menuList"))
    },
    getters: {
        GET_TOKEN: state => {
            return state.token;
        },
        GET_MENULIST: state => {
            return state.menuList;
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
        }
    },
    actions: {},
    modules: {}
});
