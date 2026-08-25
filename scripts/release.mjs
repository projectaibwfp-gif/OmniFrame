import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const releasePath = 'releases.yaml';

const run = (command, args) =>
  execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }).trim();

const yamlString = (value) => JSON.stringify(value);

const components = [
  {
    name: 'frontend',
    packagePath: 'frontend/package.json',
    lockPath: 'frontend/package-lock.json',
    sourcePath: 'frontend',
    tagPattern: 'frontend-v*',
    tagPrefix: 'frontend-v'
  },
  {
    name: 'backend',
    packagePath: 'backend/package.json',
    lockPath: 'backend/package-lock.json',
    sourcePath: 'backend',
    tagPattern: 'backend-v*',
    tagPrefix: 'backend-v'
  }
];

const getLastTag = (pattern) => {
  try {
    return run('git', ['describe', '--tags', '--abbrev=0', '--match', pattern]);
  } catch {
    return '';
  }
};

const getPushBase = () => {
  const before = process.env.GITHUB_EVENT_BEFORE;
  if (before && !/^0+$/u.test(before)) {
    return before;
  }

  try {
    return run('git', ['rev-parse', 'HEAD^']);
  } catch {
    return '';
  }
};

const getCommits = (component) => {
  const lastTag = getLastTag(component.tagPattern);
  const base = lastTag || getPushBase();
  const range = base ? `${base}..HEAD` : 'HEAD';
  const log = run('git', [
    'log',
    range,
    '--pretty=format:%H%x09%an%x09%aI%x09%s',
    '--',
    component.sourcePath
  ]);

  return log
    ? log.split('\n').map((line) => {
        const [hash, author, date, message] = line.split('\t');
        return { hash, author, date, message };
      })
    : [];
};

const getNextVersion = (currentVersion, commits) => {
  const hasBreakingChange = commits.some(
    ({ message }) => /!:/u.test(message) || message.includes('BREAKING CHANGE')
  );
  const hasFeature = commits.some(({ message }) => message.startsWith('feat'));
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  return hasBreakingChange
    ? `${major + 1}.0.0`
    : hasFeature
      ? `${major}.${minor + 1}.0`
      : `${major}.${minor}.${patch + 1}`;
};

const releaseComponents = components.map((component) => {
    const packageJson = JSON.parse(readFileSync(component.packagePath, 'utf8'));
    const commits = getCommits(component);
    const changed = commits.length > 0;
    const version = changed
      ? getNextVersion(packageJson.version, commits)
      : packageJson.version;
    const tag = changed
      ? `${component.tagPrefix}${version}`
      : getLastTag(component.tagPattern) || null;

    if (changed) {
      const packageLock = JSON.parse(readFileSync(component.lockPath, 'utf8'));

      packageJson.version = version;
      packageLock.version = version;
      if (packageLock.packages?.['']) {
        packageLock.packages[''].version = version;
      }

      writeFileSync(
        component.packagePath,
        `${JSON.stringify(packageJson, null, 2)}\n`
      );
      writeFileSync(
        component.lockPath,
        `${JSON.stringify(packageLock, null, 2)}\n`
      );
    }

    return { ...component, version, tag, commits, changed };
  });

const changedComponents = releaseComponents.filter(
  (component) => component.changed,
);

if (changedComponents.length === 0) {
  console.log('No frontend or backend commits since the last release.');
  process.exit(0);
}

const releaseCommit =
  process.env.GITHUB_SHA ??
  process.env.CI_COMMIT_SHA ??
  run('git', ['rev-parse', 'HEAD']);
const releaseDate = new Date().toISOString();
const componentYaml = releaseComponents
  .map(({ name, version, tag, commits, changed }) => {
    const commitYaml = commits
      .map(
        ({ hash, author, date, message }) =>
          `      - hash: ${yamlString(hash.slice(0, 8))}\n` +
          `        author: ${yamlString(author)}\n` +
          `        date: ${yamlString(date)}\n` +
          `        message: ${yamlString(message)}`
      )
      .join('\n');
    const commitsYaml = commitYaml ? `\n${commitYaml}` : ' []';

    return (
      `    ${name}:\n` +
      `      version: ${yamlString(version)}\n` +
      `      tag: ${yamlString(tag)}\n` +
      `      changed: ${changed}\n` +
      `      commits:${commitsYaml}`
    );
  })
  .join('\n');
const releaseYaml =
  `  - date: ${yamlString(releaseDate)}\n` +
  `    commit: ${yamlString(releaseCommit)}\n` +
  `${componentYaml}\n`;

const previousYaml = existsSync(releasePath)
  ? readFileSync(releasePath, 'utf8').replace(/^releases:\n/u, '')
  : '';
writeFileSync(releasePath, `releases:\n${releaseYaml}${previousYaml}`);

console.log(
  `Prepared ${changedComponents.map(({ name, version }) => `${name} v${version}`).join(', ')}.`
);
