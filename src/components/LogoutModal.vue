<template>
	<div id="modal">
		<div id="box">
			<h1>Logout</h1>
			<p>
				Logging out will delete your repository and GitHub auth token on the server, however it will remain on GitHub.
			</p>
			<p>
				For security purposes, I have elected not to delete the repository with the API, so you will be taken to the GitHub page where you can delete it if you'd like. 
			</p>
			<p>
				Deleting the repo from GitHub will remove your drawings from your contribution graph.
			</p>
			<button class="btn-red" @click="logout">Logout</button>
			<button @click="cancel">Cancel</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'LogoutModal',
	props: [],
	methods: {
		logout() {
			localStorage.removeItem('userID');
			location.reload();
		},
		cancel() {
			this.$el.parentNode.parentNode.removeChild(this.$el.parentNode);
		}
	}
};
</script>

<style scoped>
	#modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		display: grid;
		place-items: center;
	}
	#box {
		padding: 2em;
		box-shadow: 0 0 8px 8px rgba(0,0,0,0.19);
		background: #444;
		max-width: 700px;
	}
	p {
		margin: 0.5em 0;
	}
</style>