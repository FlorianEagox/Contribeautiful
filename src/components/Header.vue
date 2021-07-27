<template>
	<header>
		<div id="container">
			<img id="logo" src="@/assets/contribeautiful.svg" alt="logo">
			<Title />
			<button class="btn btn-red" id="logout" @click="openLogout">
				<i class="fas fa-sign-out-alt"></i>
				Logout
			</button>
		</div>
	</header>
</template>

<script>
import Title from './Title';
import LogoutModal from './LogoutModal.vue';
import { createApp } from 'vue';
export default {
	name: 'Header',
	props: ['username'],
	components: {Title},
	methods: {
		openLogout() {
			const modal = createApp(LogoutModal, {username: this.username});
			const mountPoint = document.createElement('div');
			modal.mount(mountPoint);
			document.body.appendChild(mountPoint);
			return mountPoint;
		}
	}
};
</script>

<style scoped>
	header {
		width: 100%;
		box-shadow: 0 8px 4px rgba(0, 0, 0, .3);
	}
	#container {
		width: 80%;
		display: flex;
		align-items: center;
		flex: 0;
		margin: 1em auto;
	}
	header #logo {
		width: 60px;
		margin: 0.5em;
	}
	#logout {
		margin-left: auto;
		margin-top: inherit;
	}
</style>