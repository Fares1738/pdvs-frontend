FROM node:18-alpine

RUN apk add --no-cache git

WORKDIR /app

COPY package.json ./

RUN npm cache clean --force && npm install --legacy-peer-deps

COPY . .

RUN npm run build

CMD ["npm", "run", "dev"]