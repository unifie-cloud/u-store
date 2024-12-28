
FROM nginx:alpine


ARG channel=no
ARG CI_COMMIT_BRANCH=no
ARG CI_PIPELINE_ID=1
ARG BUILD_ID=1

ENV channel=${channel}
ENV CI_COMMIT_BRANCH=${CI_COMMIT_BRANCH}
ENV CI_PIPELINE_ID=${CI_PIPELINE_ID}
ENV BUILD_ID=${BUILD_ID}

COPY ./build /usr/share/nginx/html/doc
COPY ./nginx-default.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html/doc
RUN chmod -R 777 /usr/share/nginx/html/doc


EXPOSE 4002

ENV NODE_ENV production
ARG NODE_ENV=production
ARG BUILD_ID=0 
