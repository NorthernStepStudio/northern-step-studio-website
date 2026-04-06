FROM node:22-bookworm-slim

WORKDIR /workspace/packages/m-core
COPY packages/m-core/package*.json ./
RUN npm ci
COPY packages/m-core/ ./

WORKDIR /workspace/apps/nss-missed-call-ai
COPY ["apps/NSS Missed Call Text Back/package.json", "apps/NSS Missed Call Text Back/package-lock.json", "./"]
RUN npm ci
COPY ["apps/NSS Missed Call Text Back/", "./"]

ENV RESPONSEOS_GATEWAY_HOST=0.0.0.0
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:8787/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "run", "gateway:start"]
