const git = require('nodegit');
const fs = require('fs');
const fetch = require('node-fetch');

const {firstWeekSunday} = require('../Utils');

const repoName = 'contribeautiful_data';
async function getRepo(username, accessToken, lastCommit = null) {
	try {
		try {
			return await git.Repository.open(`repos/${username}/.git`);
		} catch(e) {
			if(lastCommit) {
				try {
					const actualCommit = await fetch(`https://api.github.com/repos/${username}/${repoName}/commits`);
					if(actualCommit.ok) {
						const [{sha}] = await actualCommit.json();
						if(lastCommit != sha)
							throw {errorID: -1, message: 'Sha of last commit does not exist in the database'};
					} else
						throw {errorID: -2, message: 'failed to verify commit id'};
				} catch(e) {
					console.error(e);
					return null;
				}
			}
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
	for(let numCommits in commits) { // loop through every day
		const timestamp = Math.floor(currentDay.setDate(currentDay.getDate() + 1) / 1000); // go to the next day, storing the result as a UNIX timestamp
		const signature = git.Signature.create(username, email, timestamp, 0); // generate a git signature
		for(let i = 0; i < pixelToNumCommits(commits[numCommits]); i++) // make the specified number of commits for the day
			lastCommit = await makeCommit(repo, signature, username, `${currentDay.toISOString()}, commit ${i}`);
	}
	
	await push(repo);
	
	return getLatestCommit(repo);
}
async function update(repo, year, commits, username, email) {
	const currentDay = new Date(year, 0, 1);
	currentDay.setDate(currentDay.getDate() - 1); // Current day = the next day
	let lastCommit;
	for(const numCommits in commits) { // loop through every day
		const timestamp = Math.floor(currentDay.setDate(currentDay.getDate() + 1) / 1000); // go to the next day, storing the result as a UNIX timestamp
		if(commits[numCommits] > 0) {
			const signature = git.Signature.create(username, email, timestamp, 0); // generate a git signature
			for(let i = 0; i < pixelToNumCommits(commits[numCommits]); i++) // make the specified number of commits for the day
				lastCommit = await makeCommit(repo, signature, username, `${currentDay.toISOString()}, commit ${i}`);
		} else if(commits[numCommits] < 0) {
			// put some rebase shit
		}
	}
	await push(repo);
	return await getLatestCommit(repo);
}

// push to origin
async function push(repo) {
	await (await repo.getRemote('origin')).push(['refs/heads/main:refs/heads/main']);
}

// Gets the commits that happened during a given year
async function commitsFromYear(repo, year, callback) {
	const first = await repo.getBranchCommit('main'); // get the first commit in the repo
	const history = first.history();
	
	history.on('end', commits => { // called when commits are loaded?
		const minDate = new Date(year,  0,  1).getTime(); // timestamp first date of year
		const maxDate = new Date(year, 11, 31).getTime(); // timestamp last date of year
		let currentDay = new Date(year,  0,  1); // create date object to check every day of year
		const datesInRange = commits.map(commit => commit.date().getTime()).filter(date => minDate <= date && date <= maxDate) // Map all the commits in that year to just their times
			.reduce((obj, b) => { // Get them as just an object of how many times they occour
				obj[b] = ++obj[b] || 1;
				return obj;
			}, {});
		const commitsPerDay = [];
		while(currentDay.getTime() <= maxDate) {
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
		case 1:
			return 1;
		case 2:
			return 3;
		case 3:
			return 6;
		case 4:
			return 9;
	}
}
function commitNumToPixels(commitNum) {
	switch(commitNum) {
		case 1:
			return 1;
		case 3:
			return 2;
		case 6:
			return 3;
		case 9:
			return 4;
		default:
			return 0;
	}
}

async function makeCommit(repo, signature, dirName, message=' ') {
	const head = await git.Reference.nameToId(repo, "HEAD"); // get reference to the current state
	const parent = await repo.getCommit(head); // get the commit for current state

	// Write to a file w/ name of the last commit sha, so we have a unique file for every commit
	// This method allows us to easily "delete" commits during rebase
	fs.writeFileSync(`repos/${dirName}/${parent.sha()}`, `\n\ncommit ${message}`);
	
	const index = await repo.refreshIndex(); // read latest
	await index.addByPath(parent.sha()); // stage changes to readme
	await index.write(); // flush changes to index
	const changes = await index.writeTree(); // get reference to a set of changes
	
	// combine all info into commit and return hash
	const commit = await repo.createCommit("HEAD", signature, signature, `commit ${message}`, changes, [parent]);
	return commit;
}

async function getGitHubProifle(access_token) {
	return await (await fetch('https://api.github.com/user', {headers: {Authorization: `token ${access_token}`}})).json();
}

async function deleteCommit(repo, commitID) {
	
}

async function getLatestCommit(repo) {
	const head = await git.Reference.nameToId(repo, "HEAD"); // get reference to the current state
	return (await repo.getCommit(head)).sha(); // get the commit for current state
}

module.exports = {getRepo, makeCommits, firstWeekSunday, commitsFromYear, update, getGitHubProifle, deleteCommit, makeCommit, push};
