import { createHash } from "node:crypto";
import path from "node:path";
export const KNOWLEDGE_LANE_SPECS = [
    { lane: "studio-core", title: "Studio/Core", sourcePath: "docs/lanes/studio-core.md" },
    { lane: "nexusbuild", title: "NexusBuild", sourcePath: "docs/lanes/nexusbuild.md" },
    { lane: "provly", title: "ProvLy", sourcePath: "docs/lanes/provly.md" },
    { lane: "noobs-investing", title: "NooBS Investing", sourcePath: "docs/lanes/noobs-investing.md" },
    { lane: "neuromove", title: "Neuromove", sourcePath: "docs/lanes/neuromove.md" },
    { lane: "pasoscore", title: "PasoScore", sourcePath: "docs/lanes/pasoscore.md" },
    { lane: "mctb", title: "MCTB", sourcePath: "docs/lanes/mctb.md" },
];
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const MAX_CHUNK_CHARS = 1_500;
const STOP_WORDS = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "can",
    "for",
    "from",
    "how",
    "i",
    "if",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "our",
    "that",
    "the",
    "their",
    "there",
    "this",
    "to",
    "use",
    "was",
    "what",
    "when",
    "where",
    "which",
    "who",
    "will",
    "with",
    "you",
    "your",
]);
export function chunkKnowledgeCorpus(sources) {
    return sources.flatMap((source) => chunkKnowledgeDocument(source));
}
export function chunkKnowledgeDocument(source) {
    const markdown = normalizeLineEndings(source.markdown).trim();
    if (!markdown) {
        return [];
    }
    const documentTitle = source.title?.trim() || inferDocumentTitle(source.sourcePath, markdown);
    const knowledgeLane = inferKnowledgeLane(source.sourcePath);
    const sections = parseMarkdownSections(markdown, documentTitle);
    const now = new Date().toISOString();
    const chunks = [];
    let chunkIndex = 0;
    for (const section of sections) {
        const splitSections = splitSectionContent(section.content, MAX_CHUNK_CHARS);
        for (const content of splitSections) {
            const sectionPath = section.headingPath.join(" > ");
            const summary = summarizeText(content);
            const id = createKnowledgeChunkId(source.sourcePath, sectionPath, chunkIndex, content);
            chunks.push({
                id,
                sourcePath: source.sourcePath,
                sourceTitle: documentTitle,
                sectionPath,
                chunkIndex,
                summary,
                content,
                metadata: {
                    documentTitle,
                    sourcePath: source.sourcePath,
                    lane: knowledgeLane?.lane,
                    laneTitle: knowledgeLane?.title,
                    headingDepth: section.headingPath.length,
                    wordCount: countWords(content),
                },
                createdAt: now,
                updatedAt: now,
            });
            chunkIndex += 1;
        }
    }
    return chunks;
}
export function searchKnowledgeChunks(query, chunks, limit = 5) {
    const normalizedQuery = normalizeSearchText(query);
    const queryTerms = tokenizeSearchText(normalizedQuery);
    if (!queryTerms.length) {
        return [];
    }
    return chunks
        .map((chunk) => scoreChunk(chunk, normalizedQuery, queryTerms))
        .filter((chunk) => chunk.score > 0)
        .sort((left, right) => {
        if (right.score !== left.score) {
            return right.score - left.score;
        }
        if (left.sourceTitle !== right.sourceTitle) {
            return left.sourceTitle.localeCompare(right.sourceTitle);
        }
        return left.chunkIndex - right.chunkIndex;
    })
        .slice(0, Math.max(1, limit));
}
export function summarizeKnowledgeCoverage(chunks) {
    const documents = groupChunksBySourcePath(chunks);
    const expectedPaths = new Set(KNOWLEDGE_LANE_SPECS.map((spec) => normalizeKnowledgeSourcePath(spec.sourcePath)));
    const totalDocuments = documents.size;
    const totalChunks = chunks.length;
    const lanes = KNOWLEDGE_LANE_SPECS.map((spec) => {
        const normalizedPath = normalizeKnowledgeSourcePath(spec.sourcePath);
        const documentChunks = documents.get(normalizedPath) || [];
        const present = documentChunks.length > 0;
        return {
            lane: spec.lane,
            title: spec.title,
            sourcePath: spec.sourcePath,
            present,
            chunkCount: documentChunks.length,
        };
    });
    const presentLaneDocuments = lanes.filter((lane) => lane.present).length;
    const missingLaneDocuments = lanes.length - presentLaneDocuments;
    const unknownDocuments = [...documents.keys()]
        .filter((sourcePath) => !expectedPaths.has(sourcePath) && sourcePath.startsWith("docs/lanes/"))
        .sort((left, right) => left.localeCompare(right));
    return {
        totalDocuments,
        totalChunks,
        expectedLaneDocuments: KNOWLEDGE_LANE_SPECS.length,
        presentLaneDocuments,
        missingLaneDocuments,
        coveragePercent: Math.round((presentLaneDocuments / Math.max(1, KNOWLEDGE_LANE_SPECS.length)) * 100),
        lanes,
        unknownDocuments,
    };
}
function parseMarkdownSections(markdown, documentTitle) {
    const lines = markdown.split("\n");
    const sections = [];
    const headingStack = [];
    let buffer = [];
    const flush = () => {
        const content = buffer.join("\n").trim();
        if (!content) {
            buffer = [];
            return;
        }
        sections.push({
            headingPath: headingStack.length > 0 ? [...headingStack] : [documentTitle],
            content,
        });
        buffer = [];
    };
    for (const line of lines) {
        const match = line.match(HEADING_RE);
        if (match) {
            flush();
            const level = match[1].length;
            const heading = match[2].trim();
            while (headingStack.length >= level) {
                headingStack.pop();
            }
            headingStack.push(heading);
            continue;
        }
        buffer.push(line);
    }
    flush();
    if (sections.length === 0) {
        sections.push({
            headingPath: [documentTitle],
            content: markdown.trim(),
        });
    }
    return sections;
}
function splitSectionContent(content, maxChars) {
    const paragraphs = content
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
    const chunks = [];
    let currentParts = [];
    const flush = () => {
        const combined = currentParts.join("\n\n").trim();
        if (combined) {
            chunks.push(combined);
        }
        currentParts = [];
    };
    for (const paragraph of paragraphs) {
        const pieces = paragraph.length > maxChars ? splitLongText(paragraph, maxChars) : [paragraph];
        for (const piece of pieces) {
            const nextCombined = [...currentParts, piece].join("\n\n");
            if (currentParts.length > 0 && nextCombined.length > maxChars) {
                flush();
            }
            currentParts.push(piece);
        }
    }
    flush();
    return chunks.length > 0 ? chunks : [content.trim()];
}
function splitLongText(text, maxChars) {
    const normalized = text.trim();
    if (normalized.length <= maxChars) {
        return [normalized];
    }
    const pieces = [];
    let remaining = normalized;
    while (remaining.length > maxChars) {
        let splitAt = remaining.lastIndexOf("\n\n", maxChars);
        if (splitAt < maxChars / 2) {
            splitAt = remaining.lastIndexOf(". ", maxChars);
        }
        if (splitAt < maxChars / 2) {
            splitAt = remaining.lastIndexOf(" ", maxChars);
        }
        if (splitAt < maxChars / 2) {
            splitAt = maxChars;
        }
        const piece = remaining.slice(0, splitAt).trim();
        if (piece) {
            pieces.push(piece);
        }
        remaining = remaining.slice(splitAt).trim();
    }
    if (remaining) {
        pieces.push(remaining);
    }
    return pieces;
}
function scoreChunk(chunk, normalizedQuery, queryTerms) {
    const titleText = normalizeSearchText(`${chunk.sourceTitle} ${chunk.sectionPath}`);
    const contentText = normalizeSearchText(chunk.content);
    const sectionText = normalizeSearchText(chunk.sectionPath);
    let score = 0;
    if (normalizedQuery && titleText.includes(normalizedQuery)) {
        score += 12;
    }
    if (normalizedQuery && contentText.includes(normalizedQuery)) {
        score += 18;
    }
    let matchedTerms = 0;
    for (const term of queryTerms) {
        const titleHits = countOccurrences(titleText, term);
        const sectionHits = countOccurrences(sectionText, term);
        const contentHits = countOccurrences(contentText, term);
        if (titleHits > 0) {
            score += Math.min(titleHits, 4) * 5;
            matchedTerms += 1;
        }
        if (sectionHits > 0) {
            score += Math.min(sectionHits, 3) * 4;
        }
        if (contentHits > 0) {
            score += Math.min(contentHits, 4) * 2;
            matchedTerms += 1;
        }
    }
    if (matchedTerms >= queryTerms.length && queryTerms.length > 0) {
        score += 8;
    }
    const excerpt = buildExcerpt(chunk.content, queryTerms);
    return {
        ...chunk,
        score,
        excerpt,
    };
}
function buildExcerpt(content, queryTerms) {
    const sentences = content
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);
    for (const sentence of sentences) {
        const normalizedSentence = normalizeSearchText(sentence);
        if (queryTerms.some((term) => normalizedSentence.includes(term))) {
            return truncate(sentence, 280);
        }
    }
    return truncate(content.replace(/\s+/g, " ").trim(), 280);
}
function truncate(value, maxChars) {
    const trimmed = value.trim();
    if (trimmed.length <= maxChars) {
        return trimmed;
    }
    return `${trimmed.slice(0, Math.max(0, maxChars - 3)).trimEnd()}...`;
}
function summarizeText(value) {
    return truncate(value.replace(/\s+/g, " ").trim(), 240);
}
function countWords(value) {
    const words = tokenizeSearchText(value);
    return words.length;
}
function countOccurrences(haystack, needle) {
    if (!needle) {
        return 0;
    }
    let count = 0;
    let index = 0;
    while (index !== -1) {
        index = haystack.indexOf(needle, index);
        if (index === -1) {
            break;
        }
        count += 1;
        index += needle.length;
    }
    return count;
}
function normalizeLineEndings(value) {
    return value.replace(/\r\n/g, "\n");
}
function normalizeSearchText(value) {
    return normalizeLineEndings(String(value || ""))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function tokenizeSearchText(value) {
    return normalizeSearchText(value)
        .split(" ")
        .map((term) => term.trim())
        .filter((term) => term.length >= 2 && !STOP_WORDS.has(term));
}
function inferDocumentTitle(sourcePath, markdown) {
    const firstHeading = markdown
        .split("\n")
        .map((line) => line.trim())
        .find((line) => /^#\s+/.test(line));
    if (firstHeading) {
        return firstHeading.replace(/^#+\s+/, "").trim();
    }
    const stem = path.basename(sourcePath, path.extname(sourcePath));
    return stem
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (value) => value.toUpperCase());
}
function inferKnowledgeLane(sourcePath) {
    const normalized = normalizeKnowledgeSourcePath(sourcePath);
    return KNOWLEDGE_LANE_SPECS.find((spec) => normalizeKnowledgeSourcePath(spec.sourcePath) === normalized);
}
function groupChunksBySourcePath(chunks) {
    const grouped = new Map();
    for (const chunk of chunks) {
        const sourcePath = normalizeKnowledgeSourcePath(chunk.sourcePath);
        const existing = grouped.get(sourcePath);
        if (existing) {
            existing.push(chunk);
        }
        else {
            grouped.set(sourcePath, [chunk]);
        }
    }
    return grouped;
}
function normalizeKnowledgeSourcePath(value) {
    return value.replace(/\\/g, "/");
}
function createKnowledgeChunkId(sourcePath, sectionPath, chunkIndex, content) {
    return createHash("sha256")
        .update(sourcePath)
        .update("\n")
        .update(sectionPath)
        .update("\n")
        .update(String(chunkIndex))
        .update("\n")
        .update(content)
        .digest("hex");
}
//# sourceMappingURL=index.js.map