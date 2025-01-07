
FROM node:21


ARG channel=no
ARG CI_COMMIT_BRANCH=no
ARG CI_PIPELINE_ID=1
ARG BUILD_ID=1

ENV channel=${channel}
ENV CI_COMMIT_BRANCH=${CI_COMMIT_BRANCH}
ENV CI_PIPELINE_ID=${CI_PIPELINE_ID}
ENV BUILD_ID=${BUILD_ID}

# RUN apk add --no-cache nodejs npm
RUN apt-get update -y && apt-get install -y openssl build-essential libpq-dev 

COPY packages/store /unifie-store 
# Copy configs
COPY packages/store/unifie-configs /unifie-configs



EXPOSE 4002
CMD ["npm", "start"]

ENV NODE_ENV production
ARG NODE_ENV=production
ARG BUILD_ID=0 
WORKDIR /unifie-store