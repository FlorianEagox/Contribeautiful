<template>
	<div class="toast" :style="`animation-delay: ${TTL}.0s`">
		{{text}}
	</div>
</template>

<script>
export default {
	name: 'Toast',
	props: {text: String, 'TTL': {default: 3}},
	created() {
		if(this.TTL > 0)
			setTimeout(() => {
				document.remove(this.$el)
				this.$.appContext.app.unmount(); // Probably a dumb way to remove it, but IDK a better one in Vue 3 ;_;
			}, this.TTL * 1000 + 2000);
	},
}
</script>

<style scoped>
	.toast {
		border-radius: 5px;
		padding: 0.1em 0.3em;
		animation: fade-out 2.0s forwards;
		margin: 1em 0;
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