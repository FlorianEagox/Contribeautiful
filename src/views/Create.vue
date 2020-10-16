<template>
	<div id="chart" ref="chart">
		<div v-for="(week, weekIndex) in drawingBoard" :key="week" class="row">
			<div v-for="(day, dayIndex) in drawingBoard[weekIndex]" :key="day"
				:class="`day day-${day}`"
				@mousedown="() => {updateHoldingDown(true); colorDay(weekIndex, dayIndex)}" @mouseup="updateHoldingDown(false)"
				@mouseover="colorDay(weekIndex, dayIndex)">
			</div>
		</div>
	</div>
</template>

<script>
let drawingBoard = new Array(52).fill(0).map(_ => new Array(7).fill(0));
let currentColor = 1;
let holdingDown = false;
export default {
	name: 'Create',
	created() {
		
	},
	data() {
		return {drawingBoard, holdingDown};
	},
	methods: {
		colorDay(weekIndex, dayIndex) {
			if(holdingDown) this.drawingBoard[weekIndex][dayIndex] = currentColor;
		},
		updateHoldingDown(val) {
			holdingDown = val;
		}
	}
};
</script>

<style>
#chart {
	display: flex;
}
#chart .day {
	width: 11px;
	height: 11px;
	/* margin: 3px; */
	background: lightgray;
}
#chart .day-1 {
	background: lightgreen;
}
#chart .day:hover {
	background: grey;
}
</style>