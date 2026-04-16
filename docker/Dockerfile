FROM node:20-alpine

WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server ./
COPY .env /app/.env
EXPOSE 5000
CMD ["npm", "run", "dev"]
