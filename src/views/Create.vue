<template>
	<main>
		<section id="canvas" @wheel="cycleColor">
			<div id="chart" ref="chart" @mouseleave="holdingDown = false">
				<div v-for="(day, dayIndex) in drawingBoard" :key="dayIndex"
					:class="`day day-${day}`"
					@mousedown="holdingDown = true; colorDay(dayIndex)" @mouseup="holdingDown = false"
					@mouseover="colorDay(dayIndex)"
					v-bind:style="`background: #${colors[day]}`"> </div>
			</div>
			<div id="drawing-controls">
				<div id="colors">
					<div v-for="(color, index) in colors" :key="color"
						:style="`background: #${color}`"
						@click="changeColor(index)"
						class="color"
						:class="{ 'selected': this.currentColor == index }">
					</div>
				</div>
				<button id="btn-clear" @click="clear">Clear</button>
			</div>
		</section>
	</main>
	<img ref="importedImg">
	<form id="info">
		<label for="num-year">Year:</label>
		<input type="number" id="num-year" v-model="year">
	</form>
	<button @click="submit">Submit Contribution</button>
</template>

<script>
let drawingBoard = new Array(53 * 7).fill(0);
let currentColor = 1;
let year = new Date().getFullYear();
let holdingDown = false;
const colors = ['ebedf0', '9be9a8', '40c463', '30a14e', '216e39'];

export default {
	name: 'Create',
	async created() {
		const req = await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/graph/${localStorage.getItem('userID')}`);
		window.setGraph = graph => this.drawingBoard = graph;
		window.getGraph = () => this.drawingBoard;
		if(req.status == 404)
			return;
		const data = await req.json();
		console.log(data)
		// this.drawingBoard = data;
	},
	data() {
		return {drawingBoard, holdingDown, colors, currentColor, year};
	},
	methods: {
		colorDay(dayIndex) {
			if(this.holdingDown)
				this.drawingBoard[dayIndex] = this.currentColor;
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
			this.drawingBoard.fill(0);
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
		async submit() {
			const body = {
				user: localStorage.getItem('userID'),
				commitData: this.drawingBoard,
				year: this.year
			};
			try {
				const req = await fetch(`${process.env.VUE_APP_SERVER_BASE_URL}/graph`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				});
				if(req.ok)
					console.log(await req.text());
			} catch(e) {
				console.error(e);
			}
		}
	}
};
</script>

<style>
#canvas {
	display: inline-block;
}
#chart {
	display: grid;
	grid-template-rows: repeat(7, 1fr);
	grid-auto-flow: column;
	gap: 1px;
}
#chart .day {
	width: 15px;
	height: 15px;
	display: inline-block;
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