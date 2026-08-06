import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const packagePath = 'front/package.json';
const lockPath = 'front/package-lock.json';
const releasePath = 'releases.yaml';

const run = (command, args) =>
  execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }).trim();

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const packageLock = JSON.parse(readFileSync(lockPath, 'utf8'));
let lastTag = '';
try {
  lastTag = run('git', ['describe', '--tags', '--abbrev=0', '--match', 'v*']);
} catch {
  // First release has no previous tag.
}
const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
const log = run('git', [
  'log',
  range,
  '--pretty=format:%H%x09%an%x09%aI%x09%s'
]);

const commits = log
  ? log.split('\n').map((line) => {
      const [hash, author, date, message] = line.split('\t');
      return { hash, author, date, message };
    })
  : [];

if (commits.length === 0) {
  console.log('No commits since last release.');
  process.exit(0);
}

const hasBreakingChange = commits.some(
  ({ message }) => /!:/u.test(message) || message.includes('BREAKING CHANGE')
);
const hasFeature = commits.some(({ message }) => message.startsWith('feat'));
const [major, minor, patch] = packageJson.version.split('.').map(Number);
const version = hasBreakingChange
  ? `${major + 1}.0.0`
  : hasFeature
    ? `${major}.${minor + 1}.0`
    : `${major}.${minor}.${patch + 1}`;

packageJson.version = version;
packageLock.version = version;
if (packageLock.packages?.['']) {
  packageLock.packages[''].version = version;
}

writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
writeFileSync(lockPath, `${JSON.stringify(packageLock, null, 2)}\n`);

const releaseCommit =
  process.env.GITHUB_SHA ??
  process.env.CI_COMMIT_SHA ??
  run('git', ['rev-parse', 'HEAD']);
const releaseDate = new Date().toISOString();
const yamlString = (value) => JSON.stringify(value);
const commitYaml = commits
  .map(
    ({ hash, author, date, message }) =>
      `      - hash: ${yamlString(hash.slice(0, 8))}\n` +
      `        author: ${yamlString(author)}\n` +
      `        date: ${yamlString(date)}\n` +
      `        message: ${yamlString(message)}`
  )
  .join('\n');
const releaseYaml =
  `  - version: ${yamlString(version)}\n` +
  `    date: ${yamlString(releaseDate)}\n` +
  `    commit: ${yamlString(releaseCommit)}\n` +
  `    commits:\n${commitYaml}\n`;

const previousYaml = existsSync(releasePath)
  ? readFileSync(releasePath, 'utf8').replace(/^releases:\n/u, '')
  : '';
writeFileSync(releasePath, `releases:\n${releaseYaml}${previousYaml}`);

console.log(`Prepared release v${version} from ${commits.length} commit(s).`);
