import { createRouter, createWebHistory } from 'vue-router';
import Homepage from '@/views/Homepage.vue';
import Dashboard from '@/views/Dashboard.vue';
import Create from '@/views/Create.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component() {
			return (localStorage.getItem('userID')) ? Dashboard : Homepage;
		}
	},
	{
		path: '/:id',
		name: 'SaveID',
		component: Homepage
	},
	{
		path: '/create',
		name: 'Create',
		component: Create 
	}
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes
});

export default router;
