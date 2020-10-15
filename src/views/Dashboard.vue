<template>
	<main>
		<h1>Dashboard</h1>
		<div v-if="github_profile" id="user">
			<img :src="github_profile.avatar_url" alt="">
			<p>{{github_profile.login}}</p>
		</div>
		<div v-if="userData">{{ userData }}</div>
	</main>
</template>

<script>
let userData = null, github_profile;

export default {
	name: 'Dashboard',
	async created() {
		// const req = ;
		this.userData = await (
			await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${localStorage.getItem('userID')}`)).json();
		this.github_profile = await (
			await fetch('https://api.github.com/user', {headers: {'authorization': `token ${this.userData.access_token}`}})).json();
	},
	data() {
		return {userData, github_profile};
	}
};
</script>

<style>

</style>