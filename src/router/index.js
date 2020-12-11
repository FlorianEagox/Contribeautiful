import { createRouter, createWebHistory } from 'vue-router';
import Homepage from '@/views/Homepage.vue';
import Dashboard from '@/views/Dashboard.vue';
import Create from '@/views/Create.vue';
import About from '@/views/About.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component() {
			console.log(localStorage.getItem('userID'));
			return (localStorage.getItem('userID')) ? Dashboard : Homepage;
		}
	},
	{
		path: '/about',
		name: 'About',
		component: About
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
