import {createStore} from 'vuex';

export default createStore({
    state: {
        token: sessionStorage.getItem("token")
    },
    getters: {
        GET_TOKEN: state => {
            return state.token;
        }
    },
    mutations: {
        SET_TOKEN: (state, token) => {
            state.token = token;
            sessionStorage.setItem("token", token);
        }
    },
    actions: {},
    modules: {}
});
