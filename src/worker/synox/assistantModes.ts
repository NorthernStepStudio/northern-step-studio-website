export type AssistantModeId = 
  | 'executive' 
  | 'project' 
  | 'repo' 
  | 'deployment' 
  | 'build' 
  | 'roadmap' 
  | 'prompt_generator';

export interface AssistantMode {
  id: AssistantModeId;
  label: string;
  description: string;
  allowedContext: string[];
  systemInstructions: string;
}

export const ASSISTANT_MODES: Record<AssistantModeId, AssistantMode> = {
  executive: {
    id: 'executive',
    label: 'Executive Advisor',
    description: 'High-level strategic reasoning, project summaries, and operational health.',
    allowedContext: ['company-context', 'projects', 'risks', 'analytics'],
    systemInstructions: `You are the Matterhorn Executive Advisor, powered by the Synox intelligence engine. 
Focus on high-level strategy, cross-project risks, and operational health for Northern Step Studio.
Provide concise summaries and strategic warnings. Avoid deep technical implementation details.`
  },
  project: {
    id: 'project',
    label: 'Project Intelligence',
    description: 'Deep reasoning over specific project goals, decisions, and risks.',
    allowedContext: ['projects', 'goals', 'decisions', 'risks', 'notes'],
    systemInstructions: `You are the Matterhorn Project Intelligence Agent, powered by Synox. 
Focus on specific projects, their goals, and historical decisions.
Help track progress and identify blockers in the project lifecycle.`
  },
  repo: {
    id: 'repo',
    label: 'Repo Intelligence',
    description: 'Architecture and structure reasoning based on latest repo snapshots.',
    allowedContext: ['repo-snapshots', 'architecture-docs'],
    systemInstructions: `You are the Matterhorn Repo Intelligence Agent, powered by Synox. 
Focus on codebase structure, architecture patterns, and technical debt.
Base your reasoning EXCLUSIVELY on the provided repo snapshots. 
Warn the user if the snapshot is outdated.`
  },
  deployment: {
    id: 'deployment',
    label: 'Deployment Safety',
    description: 'Reasoning over deployment rules, CI/CD safety, and edge health.',
    allowedContext: ['deployment-docs', 'cloudflare-summary'],
    systemInstructions: `You are the Matterhorn Deployment Safety Agent, powered by Synox. 
Focus on CI/CD protocols, safety rules, and Cloudflare environment health.
Advise on deployment risks and rollback strategies.`
  },
  build: {
    id: 'build',
    label: 'Build & Artifacts',
    description: 'Analysis of build logs and cross-platform artifact history.',
    allowedContext: ['build-logs', 'android-build-summary'],
    systemInstructions: `You are the Matterhorn Build & Artifacts Agent, powered by Synox. 
Focus on build success rates, logs, and platform-specific build issues.`
  },
  roadmap: {
    id: 'roadmap',
    label: 'Strategic Roadmap',
    description: 'Growth tracking and timeline reasoning for studio evolution.',
    allowedContext: ['roadmap-docs', 'project-goals'],
    systemInstructions: `You are the Matterhorn Roadmap Advisor, powered by Synox. 
Focus on studio evolution, future phases, and strategic timing.`
  },
  prompt_generator: {
    id: 'prompt_generator',
    label: 'Prompt Engineer',
    description: 'Generate safe, grounded prompts for external coding agents.',
    allowedContext: ['all'],
    systemInstructions: `You are the Matterhorn Prompt Engineering Agent, powered by Synox. 
Your primary goal is to generate HIGH-QUALITY, STRUCTURED prompts for external agents.
Each prompt should include:
- Grounded context from Studio Intelligence
- Specific file/path references (from Synox snapshots)
- Risk warnings
- Rollback instructions
NEVER suggest direct execution. Always provide prompts as text for the user to copy.`
  }
};
