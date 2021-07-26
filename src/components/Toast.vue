<template>
	<div :class="['toast', status]" :style="`animation-delay: ${TTL}.0s`" v-text="text" />
</template>

<script>
export default {
	props: {
		text: String,
		TTL: {default: 5},
		status: {default: 'error'}
	},
	created() {
		if(this.TTL > 0)
			setTimeout(() => {
				this.$el.parentNode.parentNode.removeChild(this.$el.parentNode);
			}, this.TTL * 1000 + 2000);
	},
};
</script>

<style scoped>
	.toast {
		border-radius: 10px;
		padding: 0.2em 0.5em;
		animation: fade-out 2.0s forwards;
		margin: 1em auto;
		max-width: 500px;

	}
	.toast.success {
		background: green;
		color: white;
	}
	.toast.error {
		background: red;
		color: white;
	}
	@keyframes fade-out {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>