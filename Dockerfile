FROM rocker/geospatial:latest

SHELL ["/bin/bash", "-c"]

RUN R -e 'install.packages(c("diveMove", "trip", "adehabitatLT", "plm", "cshapes", "plumber", "STEPCAM", "MCMCglmm", "gdistance", "compositions", "latticeExtra", "ggplot2", "dplyr", "rasterVis", "RColorBrewer", "mapproj", "gridExtra"))'
# based on https://gist.github.com/remarkablemark/aacf14c29b3f01d6900d13137b21db3a
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 8.10.0
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

#WORKDIR /bindings

COPY package.json package.json

RUN npm install --production

COPY config config
COPY index.js index.js
COPY controllers controllers
COPY controllers/bindings.js controllers/bindings.js 

CMD ["node", "index.js"]
