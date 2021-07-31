const git = require('nodegit');
const fs = require('fs');
const fetch = require('node-fetch');
const {firstWeekSunday} = require('../Utils');
const { exec } = require('child_process');
const repoName = 'contribeautiful_data';

async function getRepo(userID) {
	try {
		return await git.Repository.open(`repos/${userID}/.git`);
	} catch(error) {
		// There is no way to verify the authenticity of the repo, so it's best we never clone it again after it's created.
		// There used to be some functionality here to check if the last commit matched, but it doesn't matter because the user could just append and keep that in-tact.
		// return await cloneRepo(username, accessToken, userID);
		console.error('Failed to return the repo!', error);
		throw { errorID: 1, message: 'Failed to access the local repository', error};
	}
}

async function makeCommits(repo, year, commits, username, email, userID, progress, editing = false) {
	const currentDay = new Date(year, 0, 1); // start with the first sunday of the year
	currentDay.setDate(currentDay.getDate() - 1); // Current day = the next day
	try {
		for(let numCommits in commits) { // loop through every day
			const timestamp = Math.floor(currentDay.setDate(currentDay.getDate() + 1) / 1000); // go to the next day, storing the result as a UNIX timestamp
			if(commits[numCommits] > 0) {
				const signature = git.Signature.create(username, email, timestamp, 0); // generate a git signature
				let commitsToMake = pixelToNumCommits(commits[numCommits]);
				if(editing) {
					const originalCommits = await commitsFromDay(repo, currentDay);
					commitsToMake = pixelToNumCommits(commits[numCommits]) - originalCommits.length;
				}
				for(let i = 0; i < commitsToMake; i++) { // make the specified number of commits for the day
					await makeCommit(repo, signature, userID, `${currentDay.toISOString()}, commit ${i}`);
					progress[0]++;
				}
			} else if(commits[numCommits] < 0) {
				// REBASE FUNCTIONALITY THAT DOESN'T WORK x_x
				// const numRebases = originalCommits.length - pixelToNumCommits(commitNumToPixels(originalCommits.length) - Math.abs(commits[numCommits])); // because it's negative
				// 	originalCommits[originalCommits.length - 1].parentId(0).tostrS();
				// 	exec(`git --git-dir repos/${userID}/.git rebase ${await originalCommits[originalCommits.length - 1].sha()} --onto ${originalCommits[originalCommits.length - 1].parentId(numRebases).tostrS()}`,
				// 		(e, result, error) => {
				// 			console.log ({e, result, error});
				// 		});
			}
		}
		progress[0] = 'cleaning up...';
		await cleanupRepo(repo);
		progress[0] = 'pushing...';
		await push(repo);
		return await getLatestCommit(repo);
	} catch(error) {
		console.error(error);
		throw { errorID: 3, message: 'Something went wrong trying to make commits', error};
	}
}
async function makeCommit(repo, signature, dirName, message=' ') {
	const head = await git.Reference.nameToId(repo, 'HEAD'); // get reference to the current state
	const parent = await repo.getCommit(head); // get the commit for current state

	await fs.appendFileSync(`repos/${dirName}/README.md`, `\n\ncommit ${message}`); // Modify the file
	
	// THIS HAS BEEN REMOVED BECAUSE I THINK THE REBASE FEATURE IS IMPOSSIBLE
	// Write to a file w/ name of the last commit sha, so we have a unique file for every commit
	// This method allows us to easily "delete" commits during rebase
	// fs.writeFileSync(`repos/${dirName}/${parent.sha()}`, `commit ${message}`);
	
	const index = await repo.refreshIndex(); // read latest
	await index.addByPath('README.md'); // stage changes to readme
	await index.write(); // flush changes to index
	const changes = await index.writeTree(); // get reference to a set of changes
	
	// combine all info into commit and return hash
	const commit = await repo.createCommit('HEAD', signature, signature, `commit ${message}`, changes, [parent]);
	return commit;
}

async function push(repo) {
	await (await repo.getRemote('origin')).push(['refs/heads/main:refs/heads/main']);
}

async function cleanupRepo(repo) {
	// This is used to shrink the repo size
	return new Promise((res, rej) => {
		exec(`git --git-dir="${repo.commondir()}" gc --aggressive --prune`, (error, stdout, stderr) => !error ? res(stdout) : rej(stderr));
	});
}

// Functions mostly for getting data, not creating it.

// Gets the commits that happened during a given year
async function graphFromYear(repo, year) {
	return new Promise(async(res, rej) => {
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

module.exports = {getRepo, makeCommits, firstWeekSunday, graphFromYear, getGitHubProifle, makeCommit, push, cloneRepo, computeTotalCommits, getLatestCommit, cleanupRepo};
