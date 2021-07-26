import { createRouter, createWebHistory } from 'vue-router';
import Homepage from '@/views/Homepage.vue';
import Dashboard from '@/views/Dashboard.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: localStorage.getItem('userID') ? Dashboard : Homepage
	},
	{
		path: '/:id',
		name: 'SaveID',
		component: Homepage
	}
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes
});

export default router;
