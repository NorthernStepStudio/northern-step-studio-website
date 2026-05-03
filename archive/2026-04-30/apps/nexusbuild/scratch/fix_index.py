import sys

path = 'apps/backend/src/data/index.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if "partsDatabase9" not in content:
    content = content.replace(
        "import { LATEST_CPUS, LATEST_GPUS, LATEST_MOTHERBOARDS, LATEST_CASES, LATEST_COOLING } from './partsDatabase8';",
        "import { LATEST_CPUS, LATEST_GPUS, LATEST_MOTHERBOARDS, LATEST_CASES, LATEST_COOLING } from './partsDatabase8';\nimport { ALL_PREMIUM_PARTS } from './partsDatabase9';"
    )

# Add to ALL_PARTS
if "...ALL_PREMIUM_PARTS" not in content:
    content = content.replace(
        "    ...ALL_FANS,\n]",
        "    ...ALL_FANS,\n    ...ALL_PREMIUM_PARTS,\n]"
    )

with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
