<template>
	<router-view />
</template>

<style>
	@import url("https://use.fontawesome.com/releases/v5.7.1/css/all.css");
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		/* border: 1px solid white; */
	}
	:root, body, #app, .container {
		overflow: auto;
	}
	body {
		font-family: poppins;
		background: #444;
		color: white;
	}

	button, .btn {
		display: inline-block;
		font-size: 1.2em;
		padding: 0.4em;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
		color: white;
		background: none;
		text-decoration: none;
		font-weight: bolder;
		border-radius: 30px;
		margin: 0.3em;
		border: 2px solid white;
		max-width: 300px;
	}
	button:hover, .btn:hover {
		color: rgba(0, 0, 0, .8);
		background: white;
	}
	.btn-red {
		background: maroon;
		color: white;
		border: none;
	}
	.btn-red:hover {
		background: white;
		color: maroon;
	}
</style>