FROM node:18-alpine

RUN apk add --no-cache git

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm cache clean --force && npm install --legacy-peer-deps --ignore-scripts --ignore-optional --no-audit --no-fund --no-progress --no-save --no-package-lock --no-bin-links || \
    ((if [ -f npm-debug.log ]; then \
      cat npm-debug.log; \
    fi) && false)

RUN npm install -g next

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
