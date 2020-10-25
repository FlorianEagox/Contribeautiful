<template>
	<div id="nav">
		<header>
			<img src="./assets/logo.png" alt="logo">
			<h1 id="title">Contribeautiful</h1>
			<nav>
				<ul>
					<li><a href="/">Home</a></li>
					<li><a href="/">About</a></li>
				</ul>
			</nav>
		</header>
			
		<router-link to="/">Home</router-link> |
	</div>
	<router-view />
</template>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	body {
		font-family: fantasy;
	}
	header {
		background: #333;
		color: hotpink;
		padding: 2em;
	}
	#title {
		display: inline;
	}
	nav {
		width: 100%;
		text-align: center;
	}
	nav ul {
		list-style-type: none;
		width: 100%;
	}
	nav li {
		display: inline-block;
		width: 50%;
	}
	nav a {
		text-decoration: none;
	}
</style>
