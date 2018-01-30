# Use Node v4 as the base image.
FROM node:4

ADD . /app

RUN cd /app; \
    npm install --production

EXPOSE 8080

# Run node 
CMD ["node", "/app/index.js"]