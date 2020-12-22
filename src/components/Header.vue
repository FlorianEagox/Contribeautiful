<template>
	<header>
		<div id="container">
			<img id="logo" src="@/assets/contribeautiful.svg" alt="logo">
			<Title />
			<button class="btn" id="logout">Logout</button>
		</div>
	</header>
</template>

<script>
import Title from './Title';
export default {
	name: 'Header',
	components: {Title}
}
</script>

<style scoped>
	header {
		width: 100%;
		box-shadow: 0 8px 4px rgba(0, 0, 0, .3);
	}
	#container {
		width: 80%;
		display: flex;
		align-items: center;
		flex: 0;
		margin: 1em auto;
	}
	header #logo {
		width: 60px;
	}
	#logout {
		margin-left: auto;
		margin-top: inherit;
		background: maroon;
		color: white;
		border: none;
	}
</style>