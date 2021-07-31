<template>
	<div id="modal">
		<div id="box">
			<h1>Logout</h1>
			<p>
				You can log off of the website, however your data and local repo will still remain on the server in case you ever want to make modifications to them.
			</p>
			<p>
				You can also delete your data (GH access token) as well as your local repo. Your contribution history will still remain on GitHub so long as you don't delete your contribeautiful_data repository, however, if you want to modify your history again, you'll have to delete that repo from GitHub before re-authorizing.
			</p>
			<p>For security reasons, the server will not clone your GH repo once it has been created. If you delete your data, you will be taken to a page where you can choose to delete your GH repo.</p>
			<p>
				<input id="chkDelete" type="checkbox" v-model="delData" />
				<label for="chkDelete">Delete your data?</label>
			</p>
			<button class="btn-red" @click="logout">Logout</button>
			<button @click="cancel">Cancel</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'LogoutModal',
	props: ['username'],
	data() { return {delData: false};},
	methods: {
		async logout() {
			if(this.delData) {
				await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${localStorage.getItem('userID')}`, {method: 'DELETE'});
				window.open(`https://github.com/${this.username}/contribeautiful_data/settings#danger-zone`, '_blank');
			}
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