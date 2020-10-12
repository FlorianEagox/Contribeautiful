<template>
	<main>
		<header>
			<h1>Contribeautiful</h1>
			<h2>Custom Git Contribution History</h2>
		</header>
		<section id="signup">
			<p>Login with your Github</p>
			<a :href="`https://github.com/login/oauth/authorize?client_id=${clientID}`">Sign Up</a>
		</section>
		<div>
		</div>

	</main>
</template>

<script>

export default {
	name: 'App',
	data() {
		console.log(process.env);
		return {
			clientID: process.env.VUE_APP_GH_CLIENT_ID
		}
	}
};
</script>

<style>

</style>
