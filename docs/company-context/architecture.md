# NStep System Architecture

## Overview
NStep systems are designed for high availability, low latency, and operational efficiency using modern edge-native and cloud-native technologies.

## Primary Tech Stack
- **Frontend**: React, Vite, Tailwind CSS.
- **Backend**: Cloudflare Workers (Hono framework).
- **Database**: Cloudflare D1 (SQL), Postgres (Supabase).
- **Storage**: Cloudflare R2.
- **Auth**: Google OAuth 2.0, Local PBKDF2.

## Design Patterns
- **Edge-First**: Logic resides as close to the user as possible.
- **Stateless Workers**: All state is persisted in D1 or R2.
- **Modular Monolith**: Clean separation of concerns within the worker codebase.
- **AI-Integrated**: Embedding Matterhorn agents and the Synox intelligence engine directly into operational workflows for grounded reasoning and project intelligence.
