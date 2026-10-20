const fs = require('node:fs');

const comment = process.env.RELEASE_COMMENT || '';
const match = comment.match(/^\/create-release(?:[ \t]+(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*))?[ \t]*$/);

if (!match) {
    throw new Error('Use exactly `/create-release` or `/create-release MAJOR.MINOR.PATCH`.');
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lockJson = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const conf = fs.readFileSync('conf.yml', 'utf8');
const bugReportPath = '.github/ISSUE_TEMPLATE/bug_report.yml';
const bugReport = fs.readFileSync(bugReportPath, 'utf8');
const current = packageJson.version;
const currentMatch = current.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);

if (!currentMatch) {
    throw new Error(`package.json has an invalid stable semver version: ${current}`);
}

const currentVersion = currentMatch.slice(1).map(BigInt);
const nextVersion = match[1]
    ? match.slice(1).map(BigInt)
    : [currentVersion[0], currentVersion[1], currentVersion[2] + 1n];
const version = nextVersion.map(String).join('.');
let isGreater = false;
for (let index = 0; index < nextVersion.length; index++) {
    if (nextVersion[index] === currentVersion[index]) continue;
    isGreater = nextVersion[index] > currentVersion[index];
    break;
}

if (!isGreater) {
    throw new Error(`Release version ${version} must be greater than ${current}.`);
}

if (!lockJson.packages || !lockJson.packages['']) {
    throw new Error('package-lock.json is missing its root package entry.');
}

const confVersionPattern = /^  version: "([^"]+)"$/gm;
const confVersions = [...conf.matchAll(confVersionPattern)];
if (confVersions.length !== 1 || confVersions[0][1] !== current) {
    throw new Error('conf.yml must contain exactly one version matching package.json.');
}

const bugReportVersionPattern = /(^  - type: input\r?\n    id: version\r?\n    attributes:\r?\n      label: MC Panels version\r?\n      placeholder: ")([^"]+)(")$/gm;
const bugReportVersions = [...bugReport.matchAll(bugReportVersionPattern)];
if (bugReportVersions.length !== 1 || bugReportVersions[0][2] !== current) {
    throw new Error('bug_report.yml must contain exactly one version placeholder matching package.json.');
}

packageJson.version = version;
lockJson.version = version;
lockJson.packages[''].version = version;

fs.writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);
fs.writeFileSync('package-lock.json', `${JSON.stringify(lockJson, null, 2)}\n`);
fs.writeFileSync('conf.yml', conf.replace(confVersionPattern, `  version: "${version}"`));
fs.writeFileSync(bugReportPath, bugReport.replace(bugReportVersionPattern, (_, prefix, _oldVersion, suffix) => `${prefix}${version}${suffix}`));

console.log(version);
