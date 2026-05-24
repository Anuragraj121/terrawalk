FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY tsconfig.json ./
COPY migrations ./migrations
RUN npx tsc
EXPOSE 3001
CMD ["node", "dist/index.js"]
