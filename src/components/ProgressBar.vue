<template>
	<div v-if="progress && total" id="progress-bar" :class="{hidden}">
		<div id="progress" :style="`width: ${Math.floor((progress / total) * 100)}%`">
			<h3 id="progress-status">
				<span v-if="!progress.includes('push')">{{progress}} of {{total}} commits</span>
				<span v-else>{{progress}}</span>
			</h3>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ProgressBar',
	props: ['total', 'progress', 'hidden']
};
</script>

<style>
	#progress-bar {
		width: 100%;
		height: 4em;
		background: #bbb;
		grid-row: 3;
		border-radius: 30px;
		margin-top: 1em;
		overflow: hidden;
		padding: 0.2em;
		border: 0.4em solid #999;
	}
	#progress {
		background-image: linear-gradient(90deg, hotpink, limegreen);
		height: 100%;
		border-radius: 30px;
		display: grid;
		place-items: center;
		position: relative;
		margin: auto;
	}
	#progress-status {
		position: absolute;
		overflow: visible;
		white-space: nowrap;
		text-shadow: 0 0 3px #111;
	}
	.hidden {
		visibility: hidden;
	}
</style>
