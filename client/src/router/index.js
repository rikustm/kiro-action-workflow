import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import WorkflowList from '../views/WorkflowList.vue';
import WorkflowDetails from '../views/WorkflowDetails.vue';
import TaskTypeManagement from '../views/TaskTypeManagement.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/workflows'
  },
  {
    path: '/workflows',
    name: 'WorkflowList',
    component: WorkflowList,
    meta: { requiresAuth: true }
  },
  {
    path: '/workflows/:id',
    name: 'WorkflowDetails',
    component: WorkflowDetails,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/task-types',
    name: 'TaskTypeManagement',
    component: TaskTypeManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/workflows');
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/workflows');
  } else {
    next();
  }
});

export default router;
