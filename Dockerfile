# Use Node v4 as the base image.
FROM node:4

ADD . /app

RUN cd /app; \
    npm install --production
    
# Run node 
CMD ["node", "/app/index.js"]