FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV TRUST_PROXY=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY sequelize.config.js ./
COPY migrations ./migrations
COPY seeders ./seeders

EXPOSE 3000
CMD ["sh", "-c", "npm run migrate && npm run start"]
