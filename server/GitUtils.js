const git = require('nodegit');
const fs = require('fs');

const repoName = 'contribeautiful_data';
async function cloneRepo(username, accessToken) {
	try {
		await git.Clone(`https://${username}:${accessToken}@github.com/${username}/${repoName}`, `repos/${username}`);
	} catch(e) {
		console.error(e);
		return null;
	}
}

async function makeCommits(repo, year, commits, username, email) {
	const currentDay = firstWeekSunday(year); // start with the first sunday of the year
	currentDay.setDate(currentDay.getDate() - 1); // Current day = the next day
	let lastCommit;
	for(const [day, numCommits] of commits.entries()) { // loop through every day
		const timestamp = Math.floor(currentDay.setDate(currentDay.getDate() + 1) / 1000); // go to the next day, storing the result as a UNIX timestamp
		const signature = git.Signature.create(username, email, timestamp, 0); // generate a git signature
		for(let i = 0; i < pixelToNumCommits(numCommits); i++) // make the specified number of commits for the day
			lastCommit = await makeCommit(repo, signature, username, `${currentDay}, commit ${i}`);
	}
	return lastCommit;
}

// Get the sunday of the week containing the start of a year
function firstWeekSunday(year) {
	let currentDay = new Date(`01/01/${year}`); // Get Jan 1st of the year as a start point
	while(currentDay.getDay() != 0) { // until we're on a sunday
		currentDay.setDate(currentDay.getDate() - 1); // walk backwards towards the previous day
	}
	return currentDay;
}
// map the color of the number of commits to match GitHub's minimum contriutions for that color.
function pixelToNumCommits(color) {
	switch(color) {
		case 0:
		case 1:
		case 2:
			return color;
			break;
		case 3:
			return 4;
			break;
		case 4:
			return 6;
			break;
	}
}
async function makeCommit(repo, signature, dirName, message=' ') {
	await fs.appendFileSync(`repos/${dirName}/README.md`, `\n\ncommit ${message}`); // Modify the file
	const index = await repo.refreshIndex(); // read latest
	index.addByPath('README.md'); // stage each file
	await index.write(); // flush changes to index
	const changes = await index.writeTree(); // get reference to a set of changes
	const head = await git.Reference.nameToId(repo, "HEAD"); // get reference to the current state
	const parent = await repo.getCommit(head); // get the commit for current state
	// combine all info into commit and return hash
	const commitId = await repo.createCommit("HEAD", signature, signature, `commit ${message}`, changes, [parent]);
	return commitId;
}

exports = {cloneRepo, makeCommits, firstWeekSunday}