const git = require('nodegit');
const fs = require('fs');
const fetch = require('node-fetch');

const {firstWeekSunday} = require('../Utils');

const repoName = 'contribeautiful_data';
async function getRepo(username, accessToken) {
	try {
		try {
			return await git.Repository.open(`repos/${username}/.git`);
		} catch(e) {
			return await git.Clone(`https://${username}:${accessToken}@github.com/${username}/${repoName}`, `repos/${username}`);
		}
	} catch(e) {
		console.error(e);
		return null;
	}
}

async function makeCommits(repo, year, commits, username, email) {
	const currentDay = new Date(year, 0, 1); // start with the first sunday of the year
	currentDay.setDate(currentDay.getDate() - 1); // Current day = the next day
	let lastCommit;
	for(const [day, numCommits] of commits.entries()) { // loop through every day
		const timestamp = Math.floor(currentDay.setDate(currentDay.getDate() + 1) / 1000); // go to the next day, storing the result as a UNIX timestamp
		const signature = git.Signature.create(username, email, timestamp, 0); // generate a git signature
		for(let i = 0; i < pixelToNumCommits(numCommits); i++) // make the specified number of commits for the day
			lastCommit = await makeCommit(repo, signature, username, `${currentDay.toISOString()}, commit ${i}`);
	}
	const origin = await repo.getRemote('origin');
	await origin.push(['refs/heads/main:refs/heads/main']);
	return lastCommit;
}

// Gets the commits that happened during a given year
async function commitsFromYear(repo, year, callback) {
	const first = await repo.getBranchCommit('main');
	const history = first.history();
	
	history.on('end', commits => {
		const minDate = new Date(year,  0,  1).getTime();
		const maxDate = new Date(year, 11, 31).getTime();	
		let currentDay = new Date(year,  0,  1);
		const datesInRange = commits.map(commit => commit.date().getTime()).filter(date => minDate <= date && date <= maxDate) // Map all the commits to just their times
			.reduce((obj, b) => { // Get them as just an object of how many times they occour
				obj[b] = ++obj[b] || 1;
				return obj;
			}, {});  
		const commitsPerDay = [];
		while(currentDay.getTime() < maxDate) {
			commitsPerDay.push(commitNumToPixels(datesInRange[currentDay.getTime()]));
			currentDay.setDate(currentDay.getDate() + 1);
		}
		callback(commitsPerDay);
	});
	history.start();
}

// map the color of the number of commits to match GitHub's minimum contriutions for that color.
function pixelToNumCommits(color) {
	switch(color) {
		case 0:
		case 1:
		case 2:
			return color;
		case 3:
			return 4;
		case 4:
			return 6;
	}
}
function commitNumToPixels(commitNum) {
	switch(commitNum) {
		case 0:
		case 1:
		case 2:
			return commitNum;
		case 4:
			return 3;
		case 6:
			return 4;
		default:
			return 0;
	}
}
async function makeCommit(repo, signature, dirName, message=' ') {
	await fs.appendFileSync(`repos/${dirName}/README.md`, `\n\ncommit ${message}`); // Modify the file
	const index = await repo.refreshIndex(); // read latest
	await index.addByPath('README.md'); // stage changes to readme
	await index.write(); // flush changes to index
	const changes = await index.writeTree(); // get reference to a set of changes
	const head = await git.Reference.nameToId(repo, "HEAD"); // get reference to the current state
	const parent = await repo.getCommit(head); // get the commit for current state
	// combine all info into commit and return hash
	const commitId = await repo.createCommit("HEAD", signature, signature, `commit ${message}`, changes, [parent]);
	return commitId;
}

async function getGitHubProifle(access_token) {
	return await (await fetch('https://api.github.com/user', {headers: {Authorization: `token ${access_token}`}})).json();
}

module.exports = {getRepo, makeCommits, firstWeekSunday, commitsFromYear, getGitHubProifle};
