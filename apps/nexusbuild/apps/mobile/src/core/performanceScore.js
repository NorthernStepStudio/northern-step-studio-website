import { MOCK_PARTS } from '../services/mockData';

const normalizeLabel = (value) =>
    String(value ?? '')
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const isPartRecord = (value) =>
    Boolean(
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        (Object.prototype.hasOwnProperty.call(value, 'name') ||
            Object.prototype.hasOwnProperty.call(value, 'score') ||
            Object.prototype.hasOwnProperty.call(value, 'price'))
    );

const collectPartRecords = (value, acc = []) => {
    if (!value) return acc;

    if (Array.isArray(value)) {
        value.forEach((item) => collectPartRecords(item, acc));
        return acc;
    }

    if (isPartRecord(value)) {
        acc.push(value);
        return acc;
    }

    if (typeof value === 'object') {
        Object.values(value).forEach((item) => collectPartRecords(item, acc));
    }

    return acc;
};

const parseScore = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const benchmarkCatalog = collectPartRecords(MOCK_PARTS);

// AI build recommendations use short labels that do not match the mock catalog.
const AI_BENCHMARK_ALIASES = {
    'intel i3 14100f': 9800,
    'amd ryzen 5 9600x': 17000,
    'amd ryzen 7 9800x3d': 24600,
    'amd ryzen 9 5900x': 23000,
    'amd ryzen 9 9950x': 41000,
    'rx 7600': 10200,
    'rtx 4060 ti': 11780,
    'rtx 5070': 22400,
    'rtx 5080': 28100,
    'rtx 5090': 36100,
};

const findAliasScore = (part) => {
    const targetName = normalizeLabel(part?.name || part?.title);
    if (!targetName) return 0;

    return parseScore(AI_BENCHMARK_ALIASES[targetName]);
};

const findMockScore = (part) => {
    const targetName = normalizeLabel(part?.name || part?.title);
    if (!targetName) return 0;

    const targetCategory = normalizeLabel(part?.category);
    const exactMatches = benchmarkCatalog.filter((candidate) => {
        const candidateName = normalizeLabel(candidate?.name || candidate?.title);
        if (candidateName !== targetName) return false;
        if (!targetCategory) return true;

        const candidateCategory = normalizeLabel(candidate?.category);
        return !candidateCategory || candidateCategory === targetCategory;
    });

    const match =
        exactMatches[0] ||
        benchmarkCatalog.find(
            (candidate) => normalizeLabel(candidate?.name || candidate?.title) === targetName
        );

    return parseScore(match?.score ?? match?.performanceScore ?? match?.benchmarkScore);
};

export const resolveBenchmarkScore = (part) => {
    if (!part) return 0;

    const directScore = parseScore(
        part.score ??
        part.performanceScore ??
        part.benchmarkScore ??
        part.cpu_score ??
        part.gpu_score ??
        part.nexus_power_score
    );

    if (directScore >= 1000) {
        return directScore;
    }

    const aliasScore = findAliasScore(part);
    if (aliasScore > 0) {
        return aliasScore;
    }

    if (directScore > 0) {
        return directScore;
    }

    return findMockScore(part);
};

export const hydrateBenchmarkScore = (part) => {
    const score = resolveBenchmarkScore(part);
    if (!part || !score || Number(part.score) === score) return part;
    return { ...part, score };
};

export const hydrateBuildBenchmarkScores = (build) => {
    if (!build?.parts) return build;

    const parts = Object.fromEntries(
        Object.entries(build.parts).map(([key, part]) => [key, hydrateBenchmarkScore(part)])
    );

    return {
        ...build,
        parts,
    };
};
