FROM node:8-alpine

COPY package.json package.json

RUN apk add --no-cache
RUN npm install --production

COPY config config
COPY controllers controllers
COPY controllers/bindings.js controllers/bindings.js 
COPY index.js index.js
    
CMD ["node", "index.js"]