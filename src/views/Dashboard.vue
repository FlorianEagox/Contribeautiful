<template>
	<main>
		<h1>Dashboard</h1>
		<div id="user">
			<img :src="github_profile.avatar_url" alt="">
			<p>Current Contribution History</p>
			<div id="calander" ref="calander"></div>
		</div>
		<button>Create Custom history</button>		
	</main>
</template>

<script>
import GithubCalander from 'github-calendar';

let userData = null, github_profile;

export default {
	name: 'Dashboard',
	async created() {
		const userID = localStorage.getItem('userID');
		this.userData = await (
			await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${userID}`)).json();
		const profileReq = await fetch('https://api.github.com/user', {headers: {'authorization': `token ${this.userData.access_token}`}});
		if(profileReq.ok)
			this.github_profile = await profileReq.json();
		else if(profileReq.status == 401) {
			localStorage.removeItem('userID');
			await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${userID}`, {method: 'DELETE'});
			this.$router.push('/');
		}
	},
	mounted() {
		GithubCalander('#calander', this.github_profile.login, {global_stats: true, summary_text: ' '});
	},
	data() {
		return {userData, github_profile};
	}
};
</script>

<style>

</style>