FROM node:8.9.4

ADD . /app

RUN cd /app; \
    npm install --production
    
CMD ["node", "/app/index.js"]