<template>
	<div id="container">
		<main class="grid-container">
			<div class="wrapper">
				<img id="logo" src="@/assets/contribeautiful.svg" alt="logo">
				<div id="headline" ref="main">
					<Title />
					<h2>Custom Git Contribution History</h2>
				</div>
				<div class="btn-wrapper">
					<a id="btn-github" class="btn" :href="`https://github.com/login/oauth/authorize?client_id=${clientID}&scope=${scope}`">
						<i class="fab fa-github"></i>
						<!-- Still broken in Vue3 >_< -->
						<!-- <font-awesome-icon icon="github" /> -->
						Login with Github
					</a>
					<a href="#about" id="btn-learn" class="btn">Learn More</a>
				</div>
				<p>
					Created by <a href="https://sethpainter.com">Seth Painter</a>. View on <a href="https://github.com/TheFoxarmy/contribeautiful">GitHub</a>
				</p>
			</div>
		</main>
		<section id="about" class="grid-container">
			<div class="wrapper">
				<h2>About</h2>
				<hr>
				<p>
					Contribeautiful is a webapp built to let you generate totally customizable GitHub contribution history graphs. You sign up with your GitHub account, and then you're taken to the dashboard, where you can start drawing. There are five colors, each corresponding to the number of commits needed to display that color on GitHub's site. You can also choose to use the colors for either GitHub's light or dark theme.
				</p>
				<p>
					GitHub's graph will display all contributions with your signature, even ones that have been signed in the past, so Contribeautiful can edit your history retroactively! You can also edit your graphs at any time, but, you cannot remove commits without remaking the whole repository.
				</p>
				<h3>How it works</h3>
				<p>
					You start by picking a year to draw a history of commits for. You will be presented with a graph identical to the one on your GitHub profile page where you can draw. This is sent to the server where...
					<ol>
						<li>A repository will be created on your GitHub account</li>
						<li>The repo will be cloned to the server</li>
						<li>Commits will be made in the amount you specify on the days you drew for that year</li>
						<li>The local repo will be pushed to the server.</li>
					</ol>
				</p>
				<p>
					Signing up will give the server access to a GitHub access token with limited capabilities including editing repositories (creating the contribeautiful_data repo and pushing to it) and viewing your GitHub email address (for signing commits as you).
				</p>
				<p>
					You can have this deleted and revoke access at any time, and if you want your history back to the way it was, you simply have to delete your repo from GitHub.
				</p>
				<p>
					If you don't trust this version of the service, you're always free to download the source code and run the tool yourself.
				</p>
			</div>
		</section>
	</div>
</template>

<script>
import Title from '../components/Title';
import { makeToast } from '../components/Toast.vue';

export default {
	name: 'Homepage',
	components: {Title},
	async created() {
		if(this.$route.query.id) {
			const reqUser = await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${this.$route.query.id}`);
			if(reqUser.ok) {
				const userData = await reqUser.json();
				localStorage.setItem('userID', userData._id);
				location = location.href.split('/').slice(0, -1).join('/'); // Return the URL without the last / so we don't resend the code.
			} else if(reqUser.status == 404) {
				console.log('oof!');
			}
		}
	},
	mounted() {
		if(this.$route.query.username)
			makeToast(`It seems you have previously deleted your data, but not your repo.
			Please delete your github repo <a href="https://github.com/${this.$route.query.username}/contribeautiful_data/settings#danger-zone" target="_blank">here</a> to continue using this service
`, this.$refs.main, 'error', -1);
		else if(this.$route.query.error)
			makeToast(this.$route.query.error, this.$refs.main, 'error', -1);
	},
	data() {
		return {
			clientID: process.env.VUE_APP_GH_CLIENT_ID,
			scope: 'public_repo user:email'
		};
	}
};
</script>

<style scoped>
	#container {
		scroll-snap-type: y mandatory;
		height: 100vh;
		overflow: auto;
	}
	.grid-container {
		height: 100vh;
		display: grid;
		place-items: center;
		scroll-snap-align: start end;
		overflow: auto;
	}
	a {
		color: inherit;
	}
	#logo {
		width: 200px;
	}
	#title {
		font-size: 4em;
	}
	.btn-wrapper {
		text-align: right;
		margin: 2em 0 1em;
	}
	
	#btn-learn {
		background: none;
		color: white;
	}
	
	#btn-github {
		background: white;
		color: black;
	}
	#btn-github:hover {
		box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.4);
	}
	#btn-github:active {
		background: grey;
	}

	#about .wrapper {
		max-width: 800px;
		/* line-height: 1.7em; */
	}
	#about ol {
		list-style-position: inside;
	}
	#about h2 {
		text-align: center;
		font-size: 3em;
	}
	#about h3, #about p {
		margin: 0.5em 0;
	}
@media (max-width: 600px) {
	.wrapper {
		margin: auto;
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		height: 100%;
		width: 95%;
	}
	#title {
		font-size: 2.5em;
	}
	#logo {
		margin: 0 auto;
	}
	.wrapper button, .wrapper .btn {
		font-size: 1em;
	}
}
</style>
