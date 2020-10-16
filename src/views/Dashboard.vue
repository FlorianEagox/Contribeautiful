<template>
	<main>
		<h1>Dashboard</h1>
		<div id="user">
			<img :src="github_profile.avatar_url" alt="">
			<p>Current Contribution History</p>
			<div id="calander" ref="calander"></div>
		</div>
		<button>Create Custom history</button>
		<div v-if="userData">{{ userData }}</div>
	</main>
</template>

<script>
import GithubCalander from 'github-calendar';

let userData = null, github_profile;

export default {
	name: 'Dashboard',
	async created() {
		this.userData = await (
			await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${localStorage.getItem('userID')}`)).json();
		this.github_profile = await (
			await fetch('https://api.github.com/user', {headers: {'authorization': `token ${this.userData.access_token}`}})).json();
	},
	mounted() {
		GithubCalander('#calander', this.github_profile.login, {global_stats: false, summary_text: ' '});
	},
	data() {
		return {userData, github_profile};
	}
};
</script>

<style>

</style>