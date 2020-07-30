const simpleGit = require('simple-git')
const git = simpleGit()
git.branch().then((res) => {
  console.log('res: ', res);
})

// console.log((git.branch().then((res) => {})))