FROM node:22-alpine AS builder

WORKDIR /app

# Copy SDK source first (needed for the file: dependency)
COPY ../../package.json /sdk/package.json
COPY ../../dist /sdk/dist

# Copy demo API
COPY package.json ./
RUN npm install --ignore-scripts

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /sdk /sdk
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
