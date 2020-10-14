<template>
	<main>
		<h1>Dashboard</h1>
		<div>{{ JSON.stringify(userData) }}</div>
	</main>
</template>

<script>
let userData = 1;
export default {
	name: 'Dashboard',
	created() {
		fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${localStorage.getItem('userID')}`)
			.then(res => res.json())
			.then(data => this.userData = data);
	},
	data() {
		return {userData};
	}
};
</script>

<style>

</style>