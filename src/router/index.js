import { createRouter, createWebHistory } from 'vue-router';
import Homepage from '../views/Homepage.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component() {
			return Homepage;
		}
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
