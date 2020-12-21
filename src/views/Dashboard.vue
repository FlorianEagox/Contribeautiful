<template>
	<div class="container">
		<header>
			<img id="logo" src="@/assets/contribeautiful.svg" alt="logo">
			<Title />
			<button class="btn" id="logout">Logout</button>
		</header>
		<div id="user">
			<img id="profile-picture" :src="githubProfile.avatar_url" alt="">
			<h3 id="profile-name" v-text="githubProfile.login" />
			<p>Last Commit: </p>
			<!-- <div id="calander" ref="calander"></div> -->
		</div>
		<main>
			<Canvas />
			<form id="info">
				<label for="num-year">Year</label>
				<input type="number" id="num-year" v-model="year">
			</form>
			<button @click="submit">Submit Contribution</button>
		</main>
	</div>
</template>

<script>
import GithubCalander from 'github-calendar';
import Title from '../components/Title';
import Canvas from '../components/Canvas'

let userData = null, github_profile;
export default {
	name: 'Dashboard',
	components: {Title, Canvas},
	async created() {
		const userID = localStorage.getItem('userID');
		this.userData = await ( // Get the server's userdata
			await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${userID}`)).json();
		const profileReq = await fetch('https://api.github.com/user', {headers: {'authorization': `token ${this.userData.access_token}`}});
		if(profileReq.ok) {
			this.githubProfile = await profileReq.json();
			// GithubCalander('#calander', this.githubProfile.login, {responsive: true, global_stats: true, summary_text: ' '});
		} else if(profileReq.status == 401) { // If the GH app can no longer access this user anmore
			localStorage.removeItem('userID');
			// Delete the user from the db
			await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${userID}`, {method: 'DELETE'});
			this.$router.push('/');
		}
	},
	data() {
		return {userData, githubProfile: this.githubProfile};
	}
};
</script>

<style scoped>
	header {
		width: 100%;
		box-shadow: 0 8px 4px rgba(0, 0, 0, .3);
		display: flex;
		align-items: center;
	}
	header #logo {
		width: 60px;
	}
	header #title {
		font-size: inherit;
		/* display: inline-block; */
	}
	#logout {
		margin-left: auto;
		margin-top: inherit;
		background: maroon;
		color: white;
		border: none;
	}
	#profile-picture {
		max-width: 300px;
	}


</style>