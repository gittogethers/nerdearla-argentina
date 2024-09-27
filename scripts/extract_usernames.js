const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function extractUsernames(issueNumber) {
  try {
    const { data: issue } = await octokit.issues.get({
      owner: 'gittogethers',
      repo: 'nerdearla-argentina',
      issue_number: issueNumber,
    });

    const usernames = new Set();

    // Extract usernames from issue body
    const bodyUsernames = issue.body.match(/@[a-zA-Z0-9_-]+/g);
    if (bodyUsernames) {
      bodyUsernames.forEach((username) => usernames.add(username));
    }

    // Extract usernames from comments
    const { data: comments } = await octokit.issues.listComments({
      owner: 'gittogethers',
      repo: 'nerdearla-argentina',
      issue_number: issueNumber,
    });

    comments.forEach((comment) => {
      const commentUsernames = comment.body.match(/@[a-zA-Z0-9_-]+/g);
      if (commentUsernames) {
        commentUsernames.forEach((username) => usernames.add(username));
      }
    });

    // Print usernames to console
    console.log('Extracted Usernames:', Array.from(usernames));

    // Save usernames to file
    fs.writeFileSync('usernames.txt', Array.from(usernames).join('\n'));
  } catch (error) {
    console.error('Error extracting usernames:', error);
  }
}

const issueNumber = process.argv[2];
if (!issueNumber) {
  console.error('Please provide an issue number as a command-line argument.');
  process.exit(1);
}

extractUsernames(issueNumber);
