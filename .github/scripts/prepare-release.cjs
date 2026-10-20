const fs = require('node:fs');
const path = require('node:path');

const parseVersion = (value, source) => {
    const match = value.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
    if (!match) {
        throw new Error(`${source} must use stable MAJOR.MINOR.PATCH semver; received "${value}".`);
    }

    return match.slice(1).map(BigInt);
};

const compareVersions = (left, right) => {
    for (let index = 0; index < left.length; index++) {
        if (left[index] !== right[index]) return left[index] > right[index] ? 1 : -1;
    }

    return 0;
};

const formatVersion = (parts) => parts.map(String).join('.');
const baseDirectory = process.env.BASE_DIR || '.';
const workspace = process.env.WORKSPACE_DIR || '.';
const basePackage = JSON.parse(fs.readFileSync(path.join(baseDirectory, 'package.json'), 'utf8'));
const packagePath = path.join(workspace, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const lockPath = path.join(workspace, 'package-lock.json');
const lockJson = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
const confPath = path.join(workspace, 'conf.yml');
const conf = fs.readFileSync(confPath, 'utf8');
const bugReportPath = path.join(workspace, '.github/ISSUE_TEMPLATE/bug_report.yml');
const bugReport = fs.readFileSync(bugReportPath, 'utf8');

const baseVersion = parseVersion(basePackage.version, 'Base package.json version');
const currentVersion = parseVersion(packageJson.version, 'PR package.json version');
const nextPatch = [...baseVersion];
nextPatch[2] += 1n;

const comment = process.env.RELEASE_COMMENT;
const isRelease = typeof comment === 'string';
let requestedVersion = null;
if (isRelease) {
    const match = comment.match(/^\/create-release(?:[ \t]+(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*))?[ \t]*$/);
    if (!match) {
        throw new Error('Use exactly `/create-release` or `/create-release MAJOR.MINOR.PATCH`.');
    }
    if (match[1]) {
        requestedVersion = match.slice(1).map(BigInt);
        if (compareVersions(requestedVersion, baseVersion) <= 0) {
            throw new Error(`Release version ${formatVersion(requestedVersion)} must be greater than base version ${basePackage.version}.`);
        }
    }
}

let targetVersion = compareVersions(currentVersion, nextPatch) >= 0 ? currentVersion : nextPatch;
if (requestedVersion) {
    if (compareVersions(requestedVersion, targetVersion) < 0) {
        throw new Error(`Release version ${formatVersion(requestedVersion)} cannot be lower than the PR version ${formatVersion(targetVersion)}.`);
    }
    targetVersion = requestedVersion;
}
const version = formatVersion(targetVersion);

if (!lockJson.packages || !lockJson.packages['']) {
    throw new Error('PR package-lock.json is missing its root package entry.');
}

const confVersionPattern = /^  version: "[^"]+"$/gm;
const confVersions = [...conf.matchAll(confVersionPattern)];
if (confVersions.length !== 1) {
    throw new Error('conf.yml must contain exactly one top-level extension version.');
}

const bugReportVersionPattern = /(^  - type: input\r?\n    id: version\r?\n    attributes:\r?\n      label: MC Panels version\r?\n      placeholder: ")[^"]+(")$/gm;
const bugReportVersions = [...bugReport.matchAll(bugReportVersionPattern)];
if (bugReportVersions.length !== 1) {
    throw new Error('bug_report.yml must contain exactly one MC Panels version placeholder.');
}

packageJson.version = version;
lockJson.version = version;
lockJson.packages[''].version = version;

fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
fs.writeFileSync(lockPath, `${JSON.stringify(lockJson, null, 2)}\n`);
fs.writeFileSync(confPath, conf.replace(confVersionPattern, `  version: "${version}"`));
fs.writeFileSync(bugReportPath, bugReport.replace(bugReportVersionPattern, (_, prefix, suffix) => `${prefix}${version}${suffix}`));

console.log(version);
