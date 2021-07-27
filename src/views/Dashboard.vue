<template>
	<Header :username="githubProfile?.login" />		
	<div class="container" ref="main">
		<h1 id="lbl-dashboard">Dashboard</h1>
		<div id="user">
			<img id="profile-picture" :src="githubProfile?.avatar_url" alt="profile pic" >
			<div class="text">
				<h3 id="profile-name" v-text="githubProfile?.login" />
				<p v-if="lastCommit">Last Commit:
					<a 	id="last-commit"
						:href="`https://github.com/${githubProfile?.login}/contribeautiful_data/commit/${userData?.lastCommit}`"
						target="_blank"
						v-text="lastCommit" />
				</p>
			</div>
		</div>
		<main>
			<Canvas :year="selectedYear" :username="githubProfile?.login" id="canvas" ref="canvas" />
			<section id="year">
				<p>Year</p>
				<hr>
				<ul>
					<li v-for="year in yearSpan" :key="year">
						<input type="radio" :id="`rad-${year}`" :value="year" v-model="selectedYear" name="year" @change="selectYear">
						<label :for="`rad-${year}`" v-text="year"/>
					</li>
				</ul>
			</section>
			<ProgressBar :total="progressTotal" :progress="progress" :hidden="progressHidden" />
			<button @click="submit" id="submit" class="btn" v-text="!editing ? 'Submit Contributions' : 'Edit Contributions'" />
		</main>
	</div>
</template>

<script>
import Header from '../components/Header';
import Canvas from '../components/Canvas';
import ProgressBar from '../components/ProgressBar';
import Toast from '../components/Toast';
import {createApp} from 'vue';

let userData = null;
const currentYear = new Date().getFullYear();
let selectedYear = currentYear;

export default {
	name: 'Dashboard',
	components: {Header, Canvas, ProgressBar},
	async created() {
		try {
			const userID = localStorage.getItem('userID');
			const userReq = await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${userID}`);
			if(!userReq.ok) {
				localStorage.removeItem('userID');
				location.reload();
				return;
			}
			this.userData = await userReq.json();
			this.lastCommit = this.userData.lastCommit;
			const profileReq = await fetch('https://api.github.com/user', {headers: {'authorization': `token ${this.userData.access_token}`}});
			if(profileReq.ok) {
				this.githubProfile = await profileReq.json();
				const minYear = new Date(this.githubProfile.created_at).getFullYear(); // Only show years after the profile was created.
				this.yearSpan = [];
				for(let year = currentYear; year >= minYear; year--)
					this.yearSpan.push(year);
				this.selectYear();
			} else if(profileReq.status == 401) { // If the GH app can no longer access this user anymore
				localStorage.removeItem('userID');
				// Delete the user from the db
				await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/user/${userID}`, {method: 'DELETE'});
				this.makeToast('It appears the API no longer has access to your accont \n You can re-authorize after reloading', 'error', 10);
				setTimeout(() => {
					this.$router.push('/');
				}, 10000);
			}
		} catch(e) {
			this.makeToast(`Something went wrong connection to the server or GitHub \n ${e}`);
		}
	},
	data() {
		return {
			userData,
			githubProfile: this.githubProfile,
			yearSpan: this.yearSpan,
			selectedYear,
			editing: this.editing,
			lastCommit: '',
			progress: 0,
			progressTotal: 100,
			progressHidden: true
		};
	},
	methods: {
		async submit() {
			this.progressHidden = false;
			let commitData = this.$refs.canvas.drawingBoard;
			let method = 'POST';
			if(this.editing) {
				commitData = commitData.map((newVal, index) => newVal - this.originalData[index]);
				method = 'PATCH';
			}
			const body = {
				user: localStorage.getItem('userID'),
				commitData,
				year: this.selectedYear
			};
			try {
				const response = await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/graph`, {
					method,
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				});
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				while (true) { // Continously run the loop while the request is ongoing
					let { done, value } = await reader.read();
					if (done) break; // When the request compltes, stop updating the progress bar
					value = decoder.decode(value); // Converts from Unit8 Array to text
					if(value.includes('total')) // the total ammount of commits to be made
						this.progressTotal = value.split(' ')[1]; 
					else if(value.includes('lastid')) // The last thing transmitted, and the final commit made
						this.lastCommit = value.split(' ')[1];
					else if(value.includes('error')) {
						console.error(value);
						this.makeToast(`Something went wrong!\n ${value}`);
						return;
					}
					else
						this.progress = value; // Update the progress bar
				}
				if(response.ok) {
					this.selectYear(); // This triggers the client to update and shows the user that their commits have been made.
					this.makeToast(`made ${this.progressTotal} commits & pushed to GitHub!`, 'success');
				}
				else
					this.makeToast(`Something went wrong! \n ${await response.text()}`);
			} catch(e) {
				console.error(e);
				this.makeToast(`Something went wrong! \n ${e}`);
			}
			this.progressHidden = true; // hide the progress bar when the requst is done
		},
		async selectYear() {
			try {
				const req = await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/graph/${localStorage.getItem('userID')}/${this.selectedYear}`);
				if(req.ok) {
					this.$refs.canvas.initialize(await req.json());
					this.editing = true;
					this.originalData = [...this.$refs.canvas.drawingBoard];
				} else {
					this.$refs.canvas.initialize();
					this.editing = false;
				}
			} catch(e) {
				console.error(e);
				this.makeToast(`Something went terribly wrong! \n ${e}`);
			}
		},
		async makeToast(text, status = 'error', TTL = 5) {
			const errorToast = createApp(Toast, { text, status, TTL});
			const mountPoint = document.createElement('div');
			errorToast.mount(mountPoint);
			this.$refs.main.insertAdjacentElement('afterend', mountPoint);
			return mountPoint;
		},
	}
};
</script>

<style scoped>
	.container {
		display: grid;
		place-items: center;
		justify-content: space-evenly;
		align-content: start;
		grid-auto-flow: row;
	}
	.container > * {
		grid-column: 1/3;
	}
	#lbl-dashboard {
		text-align: center;
		padding: 0 0.4em;
		padding-bottom: 0.4em;
		margin: 1em auto 4em;
		border-bottom: 3px solid white;
	}

	#user {
		border-radius: 25px;
		box-shadow: 0 0 5px rgba(0, 0, 0, 1);
		overflow: hidden;
		word-wrap: break-word;
		max-width: 300px;
		grid-column: 1 / 2;
		gap: 4em;
	}
	#user img {
		max-width: 100%;
	}
	#user .text {
		padding: 1em;
	}
	#user #last-commit {
		color: hotpink ;
	}
	main {
		display: grid;
		grid-column: 2 / 3 !important;
		grid-auto-flow: row;
		justify-items: start;
	}
	#canvas {
		align-self: center;
	}
	#year {
		padding: 0 1em;
		grid-column: 2;
		grid-row: 1;
	}
	#year [type=radio] {
		display: none;
	}
	#year ul {
		list-style-type: none;
	}
	#year label {
		display: block;
		margin-top: 0.1em;
		padding: 0.3em 0.7em;
		border-radius: 5px;
	}
	#year input:checked ~ label {
		background: mediumslateblue;
	}
	#year label:hover {
		background: #666;
	}
</style>
