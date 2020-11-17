<template>
	<main>
		<section id="canvas" @wheel="cycleColor">
			<div id="chart" ref="chart" @mouseleave="holdingDown = false">
				<div v-for="(week, weekIndex) in drawingBoard" :key="week" class="row">
					<div v-for="(day, dayIndex) in drawingBoard[weekIndex]" :key="day"
						:class="`day day-${day}`"
						@mousedown="holdingDown = true; colorDay(weekIndex, dayIndex)" @mouseup="holdingDown = false"
						@mouseover="colorDay(weekIndex, dayIndex)"
						v-bind:style="`background: #${colors[day]}`">
					</div>
				</div>
			</div>
			<div id="drawing-controls">
				<div id="colors">
					<div v-for="(color, index) in colors" :key="index"
						:style="`background: #${color}`"
						@click="changeColor(index)"
						class="color"
						:class="{ 'selected': this.currentColor == index }">
					</div>
				</div>
				<input type="file" id="import" ref="import" accept=".jpg, .jpeg, .png" @change="importImage">
				<button id="btn-clear" @click="clear">Clear</button>
			</div>
		</section>
	</main>
	<img ref="importedImg">
	<form id="info">
		<label for="trim-edges">Trim Sides</label>
		<input type="checkbox" name="chkTrim" v-model="trim" id="trim-edges">
		<label for="commit-time">Commit time</label>
		<input type="time" name="time" v-model="commitTime" id="commit-time">
	</form>
	<button @click="submit">Submit Contribution</button>
</template>

<script>
let drawingBoard = new Array(53).fill(0).map(() => new Array(7).fill(0));
let currentColor = 1;
let trim = false;
let commitTime = '12:34';
let holdingDown = false;
const colors = ['ebedf0', '9be9a8', '40c463', '30a14e', '216e39'];
export default {
	name: 'Create',
	async created() {
		const req = await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/graph/${localStorage.getItem('userID')}`);
		if(req.status == 404)
			return;
		const data = await req.json();
		this.drawingBoard = data.commitData;
	},
	data() {
		return {drawingBoard, holdingDown, colors, currentColor, trim, commitTime};
	},
	methods: {
		colorDay(weekIndex, dayIndex) {
			if(this.holdingDown) this.drawingBoard[weekIndex][dayIndex] = this.currentColor;
		},
		updateHoldingDown(val) {
			holdingDown = val;
		},
		changeColor(color) {
			this.currentColor = color;
		},
		cycleColor(e) {
			this.currentColor += e.deltaY > 0 ? 1 : -1;
			if(this.currentColor >= colors.length) this.currentColor = 0;
			else if(this.currentColor < 0) this.currentColor = colors.length - 1;
		},
		clear() {
			this.drawingBoard = new Array(53).fill(0).map(() => new Array(7).fill(0));
		},
		importImage(e) {
			const file = e.target.files[0];
			// const img = this.$refs.importedImg;
			const img = new Image(53, 7);
			const reader = new FileReader();
			reader.addEventListener('load', (e) => {
				img.src = e.target.result;
				document.body.append(img);
				createImageBitmap(img).then(imageData => {
					console.log('hi!');
				});
			});
			reader.readAsDataURL(file);
		},
		submit() {
			const body = {
				user: localStorage.getItem('userID'),
				commitData: this.drawingBoard
			};
			if(commitTime != '23:30')
				body.time = commitTime;
			if(trim)
				body.trim = true;
			fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/graph`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			})
				.then(res => res.json())
				.then(data => console.log(data));
		},
	}
};
</script>

<style>
#canvas {
	display: inline-block;
}
#chart {
	display: flex;
	background: #ebedf0;
}
#chart .day {
	width: 15px;
	height: 15px;
	margin: 1px;
}
#chart .day:hover {
	border: 1px solid grey;
}
#drawing-controls {
	display: flex;
	justify-content: space-between;
}
.color {
	display: inline-block;
	width: 11px;
	height: 11px;
}
.selected {
	border: 1px solid blue;
	margin: 1px;
}
</style>