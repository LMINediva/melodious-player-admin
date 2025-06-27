import router from '@/router/index';
import store from '@/store';

router.beforeEach((to, from, next) => {
    // 白名单
    const whiteList = ['/login'];
    let token = store.getters.GET_TOKEN;
    if (token) {
        next();
    } else {
        if (whiteList.includes(to.path)) {
            next();
        } else {
            next("/login");
        }
    }
});