# Single-service deploy: builds the frontend, then serves it from the Express backend.
FROM node:22-alpine AS web
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json backend/
RUN cd backend && npm ci --omit=dev
COPY backend backend
COPY --from=web /app/frontend/dist frontend/dist
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node", "backend/src/index.js"]
