const git = require('nodegit');
const fs = require('fs');
const fetch = require('node-fetch');
const {firstWeekSunday} = require('../Utils');
const { exec } = require('child_process');
const repoName = 'contribeautiful_data';

async function getRepo(username, accessToken, userID, lastCommit = null) {
	try {
		try {
			return await git.Repository.open(`repos/${userID}/.git`);
		} catch(e) {
			// For security reasons, we should NEVER pull the users's repo. They could use this to download unauthorized files on the server.
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
			return await cloneRepo(username, accessToken, userID);
		}
	} catch(e) {
		console.error('Failed to return the repo!', e);
		return null;
	}
}

async function makeCommits(repo, year, commits, username, email, userID, progress) {
	const currentDay = new Date(year, 0, 1); // start with the first sunday of the year
	currentDay.setDate(currentDay.getDate() - 1); // Current day = the next day
	try {
		for(let numCommits in commits) { // loop through every day
			const timestamp = Math.floor(currentDay.setDate(currentDay.getDate() + 1) / 1000); // go to the next day, storing the result as a UNIX timestamp
			if(commits[numCommits] > 0) {
				const signature = git.Signature.create(username, email, timestamp, 0); // generate a git signature
				for(let i = 0; i < pixelToNumCommits(commits[numCommits]); i++) { // make the specified number of commits for the day
					await makeCommit(repo, signature, userID, `${currentDay.toISOString()}, commit ${i}`);
					progress[0]++;
				}
			} else if(commits[numCommits] < 0) {
				const originalCommits = await commitsFromDay(repo, currentDay);
				const numRebases = originalCommits.length - pixelToNumCommits(commitNumToPixels(originalCommits.length) - Math.abs(commits[numCommits])); // because it's negative
				originalCommits[originalCommits.length - 1].parentId(0).tostrS();
				exec(`git --git-dir repos/${userID}/.git rebase ${await originalCommits[originalCommits.length - 1].sha()} --onto ${originalCommits[originalCommits.length - 1].parentId(0).tostrS()}`,
					(e, result, error) => {
						console.log ({e, result, error});
					});
			}
		}
		progress[0] = 'pushing...';
		// await push(repo);
		return await getLatestCommit(repo);
	} catch(e) {
		console.error(e);
		throw { errorID: 3, message: `Something went wrong trying to make commits\n ${e}` };
	}
}

async function makeCommit(repo, signature, dirName, message=' ') {
	const head = await git.Reference.nameToId(repo, 'HEAD'); // get reference to the current state
	const parent = await repo.getCommit(head); // get the commit for current state

	// Write to a file w/ name of the last commit sha, so we have a unique file for every commit
	// This method allows us to easily "delete" commits during rebase
	fs.writeFileSync(`repos/${dirName}/${parent.sha()}`, `commit ${message}`);
	
	const index = await repo.refreshIndex(); // read latest
	await index.addByPath(parent.sha()); // stage changes to readme
	await index.write(); // flush changes to index
	const changes = await index.writeTree(); // get reference to a set of changes
	
	// combine all info into commit and return hash
	const commit = await repo.createCommit('HEAD', signature, signature, `commit ${message}`, changes, [parent]);
	return commit;
}

async function deleteCommit(repo, commit) {
	// git.Rebase.init(repo, commit, )
}

async function push(repo) {
	await (await repo.getRemote('origin')).push(['refs/heads/main:refs/heads/main']);
}

// Functions mostly for getting data, not creating it.

// Gets the commits that happened during a given year
async function commitsBetweenDates(repo, minDate, maxDate, outCommits) {
	return new Promise( async(res, rej) => {
		const first = await repo.getBranchCommit('main'); // get the first commit in the repo
		const history = first.history();
		
		history.on('end', commits => { // called when commits are loaded?
			const minTime = minDate.getTime();
			const maxTime = maxDate.getTime();
			let currentDay = minDate; // the current date of the range
			let commitsFromDay = commits.filter(commit => minTime <= commit.date().getTime() && commit.date().getTime() <= maxTime);
			if(outCommits) outCommits[0] = commitsFromDay;
			const datesInRange = commitsFromDay.map(commit => commit.date().getTime()) // Map all the commits in that range to just their times
				.reduce((obj, b) => { // Get them as just an object of how many times they occour
					obj[b] = ++obj[b] || 1; // When the date's already in the array, add to it, otherwise, put it in there with the intial value of one occourance.
					return obj;
				}, {});
			const commitsPerDay = [];
			while(currentDay.getTime() < maxTime) {
				commitsPerDay.push(commitNumToPixels(datesInRange[currentDay.getTime()]));
				currentDay.setDate(currentDay.getDate() + 1);
			}
			res(commitsPerDay);
		});
		history.start();
	});
}

async function commitsFromDay(repo, day) {
	return new Promise(async(res, rej) => {
		const first = await repo.getBranchCommit('main'); // get the first commit in the repo
		const history = first.history();
		
		history.on('end', commits => { // called when commits are loaded?
			res(commits.filter(commit => day.getTime() == commit.date().getTime()));
		});
		history.start();
	});
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
	default:
		return 0;
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

async function getGitHubProifle(access_token) {
	return await (await fetch('https://api.github.com/user', {headers: {Authorization: `token ${access_token}`}})).json();
}

async function getLatestCommit(repo) {
	const head = await git.Reference.nameToId(repo, 'HEAD'); // get reference to the current state
	return (await repo.getCommit(head)).sha(); // get the commit for current state
}

async function cloneRepo(username, accessToken, userID) {
	git.Clone(`https://${username}:${accessToken}@github.com/${username}/${repoName}`, `repos/${userID}`);
}

function computeTotalCommits(commits) {
	return commits.filter(commit => commit != 0).map(commit => pixelToNumCommits(Math.abs(commit))).reduce((commit, total) => commit + total, 0);
}

module.exports = {getRepo, makeCommits, firstWeekSunday, commitsBetweenDates, getGitHubProifle, deleteCommit, makeCommit, push, cloneRepo, computeTotalCommits, getLatestCommit};
