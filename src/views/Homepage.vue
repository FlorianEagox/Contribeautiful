<template>
	<main>
		<h2>Custom Git Contribution History</h2>
		<section id="signup">
			<p>Login with your Github</p>
			<a :href="`https://github.com/login/oauth/authorize?client_id=${clientID}`">Sign Up</a>
		</section>
	</main>
</template>

<script>

export default {
	name: 'Homepage',
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
			clientID: process.env.VUE_APP_GH_CLIENT_ID
		};
	}
};
</script>
