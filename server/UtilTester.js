const GitUtils = require('./GitUtils');
const Git = require('nodegit');

async function testAll() {
	const commitData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,4,0,0,0,4,0,0,0,4,4,4,0,0,0,4,0,0,0,4,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,3,2,2,3,0,0,0,3,2,1,2,3,0,0,0,3,0,1,2,3,0,3,2,1,2,3,0,0,3,2,2,3,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,3,1,1,1,1,3,0,3,1,1,3,1,3,0,3,1,1,3,1,3,0,0,3,1,3,3,0,0,0,0,0,0,0,0,0,3,0,0,3,3,3,3,1,3,0,3,1,1,0,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,3,0,0,0,0,0,3,1,3,3,3,3,0,0,3,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,1,1,2,1,1,0,0,1,1,2,1,1,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,1,1,1,2,0,0,0,1,1,1,2,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,2,1,1,2,0,0,0,2,1,1,2,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0,0,4,1,0,1,4,0,4,0,4,4,4,0,0,0,0,0,0,0,0,0,0];
	const repo = await GitUtils.getRepo('testarooni', 'token');
	// const repo = await Git.Repository.open('repos/TheFoxarmy');
	// const lastCommit = await GitUtils.makeCommits(repo, '2015', commitData, 'TheFoxarmy', 'seth@sethpainter.com')
	GitUtils.commitsFromYear(repo, 2020, console.log);
}

async function testNums(num) {
	const repo = await Git.Repository.open('repos/TheFoxarmy');
	const currentDay = new Date(2018, 9, 6);
	currentDay.setDate(currentDay.getDate() - 1); // Current day = the next day
	for(let day = 0; day < num; day++) {
		const timestamp = Math.floor(currentDay.setDate(currentDay.getDate() + 1) / 1000);
		const signature = Git.Signature.create('TheFoxarmy', 'seth@sethpainter.com', timestamp, 0); // generate a git signature
		for(let i = 0; i < day; i++) 
			await GitUtils.makeCommit(repo, signature, 'TheFoxarmy', `testing nums ${currentDay} ${i}`);
	}
	await GitUtils.push(repo);
}

// console.log(
// 	GitUtils.computeTotalCommits([0,0,0,4,3,2,1,0,0,4,3,2,1,2,0,4,3,2,1,2,3,4,3,2,1,2,3,4,3,2,1,2,3,4,0,2,1,2,3,4,0,0,1,2,3,4,0,0,0,2,1,2,3,4,0,0,3,2,1,2,3,4,0,4,3,2,1,2,3,4,0,4,3,2,1,2,3,0,0,4,3,2,1,2,0,0,0,4,3,2,1,0,0,4,3,2,1,2,0,4,3,2,1,2,3,4,3,2,1,2,3,4,3,2,1,2,3,4,0,2,1,2,3,4,0,0,1,2,3,4,0,0,0,2,1,2,3,4,0,0,3,2,1,2,3,4,0,4,3,2,1,2,3,4,0,4,3,2,1,2,3,0,0,4,3,2,1,2,0,0,0,4,3,2,1,0,0,4,3,2,1,2,0,4,3,2,1,2,3,4,3,2,1,2,3,4,3,2,1,2,3,4,0,2,1,2,3,4,0,0,1,2,3,4,0,0,0,2,1,2,3,4,0,0,3,2,1,2,3,4,0,4,3,2,1,2,3,4,0,4,3,2,1,2,3,0,0,4,3,2,1,2,0,0,0,4,3,2,1,0,0,4,3,2,1,2,0,4,3,2,1,2,3,4,3,2,1,2,3,4,3,2,1,2,3,4,0,2,1,2,3,4,0,0,1,2,3,4,0,0,0,2,1,2,3,4,0,0,3,2,1,2,3,4,0,4,3,2,1,2,3,4,0,4,3,2,1,2,3,0,0,4,3,2,1,2,0,0,0,4,3,2,1,0,0,4,3,2,1,2,0,4,3,2,1,2,3,4,3,2,1,2,3,4,3,2,1,2,3,4,0])
// );

// (async () => console.log(await GitUtils.getLatestCommit(await Git.Repository.open('repos/TheFoxarmy'))))();


// DOES NOT WORK AT ALL x_x
// (async() => {
// 	const repo = await Git.Repository.open('rebase');
// 	const branch = await repo.getBranchCommit('master');
// 	const head = await Git.AnnotatedCommit.lookup(repo, branch.id());
// 	const commit = await await repo.getCommit('aa4f4cf4f89ea9f28bc39268a5ca2843d58db9d9');//await Git.AnnotatedCommit.lookup(repo, 'aa4f4cf4f89ea9f28bc39268a5ca2843d58db9d9');
// 	const parent = await commit.parent(0);
// 	const rebase = await Git.Rebase.init(repo, head, commit, parent); // THESE COMBINATIONS DO NOT WORK (N is null) Hct cct ctt Htc cNt ctN tcN tNc
// 	// rebase.finish(Git.Signature.create('Seth Painter', 'seth@sethpainter.com', new Date().getTime(), 0));
// 	console.log(rebase);
// });//();

// Cleanup
// (async() => {
// 	try {
// 		let result = await GitUtils.cleanupRepo(await GitUtils.getRepo(''));
// 		console.log(result)
// 	} catch(e) {
// 		console.error(e)}
// })();