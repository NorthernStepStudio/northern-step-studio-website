# TTS App

Custom text-to-speech and sound-generation stack used by the studio.

## Current runtime reality

This project is not a plain Cloud Run target right now.

Reasons:

- the API imports heavy ML dependencies such as `torch`, `diffusers`, and `transformers`
- startup preloads engines and voice libraries, which is expensive for a small always-on service
- the current codebase still carries desktop-style assumptions such as local model folders and local output directories
- the existing runtime has Windows-oriented defaults like the `eSpeak NG` path

## What was improved here

- the API no longer hardcodes the host and port in `api/main.py`
- `ESPEAK_PATH` is now configurable through environment variables instead of always assuming the default Windows install path

## Recommended hosting path

Use one of these when you are ready to host it:

1. Keep it local-only if it is mainly a creator tool.
2. Move it to a dedicated container host with enough memory and CPU if you want a remote API.
3. Rework it into smaller services before considering Cloud Run.

## Why I am not adding a Cloud Run deploy script yet

Adding a deploy script right now would be misleading. The service still needs a deliberate Linux containerization pass, model packaging decisions, and a compute sizing decision before it should be deployed remotely.
