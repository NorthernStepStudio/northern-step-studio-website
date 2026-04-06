const fs = require('fs');
const path = require('path');

const mode = process.argv[2];
const validModes = new Set(['sync', 'patch', 'minor', 'major']);

if (!validModes.has(mode)) {
    console.error('Usage: node ./scripts/bump-version.cjs <sync|patch|minor|major>');
    process.exit(1);
}

const packagePath = path.join(__dirname, '..', 'package.json');

const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const parseVersion = (value) => {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
    if (!match) {
        throw new Error(`Invalid semantic version: ${value}`);
    }

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
    };
};

const formatVersion = ({ major, minor, patch }) => `${major}.${minor}.${patch}`;

const bumpVersion = (current, bumpMode) => {
    const next = { ...current };

    if (bumpMode === 'major') {
        next.major += 1;
        next.minor = 0;
        next.patch = 0;
        return next;
    }

    if (bumpMode === 'minor') {
        next.minor += 1;
        next.patch = 0;
        return next;
    }

    next.patch += 1;
    return next;
};

const currentVersion = packageJson.version || '0.0.0';
const nextVersion =
    mode === 'sync'
        ? currentVersion
        : formatVersion(bumpVersion(parseVersion(currentVersion), mode));

packageJson.version = nextVersion;

fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log(`NexusBuild mobile version ${mode === 'sync' ? 'synced' : 'bumped'} to ${nextVersion}`);
