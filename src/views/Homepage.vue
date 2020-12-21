<template>
	<div id="container">
		<main class="grid-container">
			<div class="wrapper">
				<img id="logo" src="@/assets/contribeautiful.svg" alt="logo">
				<div id="headline">
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
					<a href="#" id="btn-learn" class="btn">Learn More</a>
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
					Contribeautiful is a webapp built to let you generate totally customizable GitHub contribution history graphs. You sign up with your github link, and then you're taken to the dashboard, where you can start drawing. There are five colors, each representing the ammount of commits needed to display that color on GitHub's site. The program will detect which theme you use on GitHub (light or dark), and use that color scheme.
				</p>
				<h3>How it works</h3>
				<p>
					When you draw your first graph, it will be submitted to the server where four things will happen
					<ol>
						<li>A repository will be created on your github account</li>
						<li>The repo will be cloned to the server</li>
						<li>Commits will be made each day and for the minimum ammount according to your drawing</li>
						<li>The local repo will be pushed to the server.</li>
					</ol>
				</p>
			</div>
		</section>
	</div>
</template>

<script>
import Title from '../components/Title';

export default {
	name: 'Homepage',
	components: {Title},
	async created() {
		if(this.$route.params.id) {
			const reqUser = await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${this.$route.params.id}`);
			if(reqUser.ok) {
				const userData = await reqUser.json();
				localStorage.setItem('userID', userData._id);
				this.$router.push('/');
			} else if(reqUser.status == 404) {
				console.log('oof!');
			}
		}
	},
	data() {
		return {
			clientID: process.env.VUE_APP_GH_CLIENT_ID,
			scope: 'public_repo user:email'
		};
	}
};
</script>

<style>
	@import url("https://use.fontawesome.com/releases/v5.7.1/css/all.css");
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	body {
		font-family: poppins;
		background: #444;
		color: white;
	}
	.grid-container {
		height: 100vh;
		display: grid;
		place-items: center;
	}
	.wrapper {
		/* text-align: center; */
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
	}
	.btn {
		display: inline-block;
		font-size: 1.2em;
		padding: 0.4em;
		background: white;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
		color: black;
		text-decoration: none;
		font-weight: bolder;
		border-radius: 30px;
		margin: 0.3em;
		margin-top: 2em;
	}
	#btn-learn {
		background: none;
		border: 2px solid white;
		color: white;
	}
	#btn-learn:hover {
		color: rgba(0, 0, 0, .8);
		background: white;
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
	#about h3, p {
		margin: 0.5em 0;
	}
</style>
