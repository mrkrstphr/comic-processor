FROM alpine:3.18

ARG BUILD_DATE
ARG DRONE_TAG
ARG DRONE_COMMIT_SHA

LABEL maintainer="kristopherwilson@gmail.com"

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.build-date=$BUILD_DATE
LABEL org.label-schema.name="mrkrstphr/comic-processor"
LABEL org.label-schema.description="Processes various comic files"
LABEL org.label-schema.url="https://github.com/mrkrstphr/comic-processor"
LABEL org.label-schema.vcs-url="https://github.com/mrkrstphr/comic-processor"
LABEL org.label-schema.vcs-ref=$DRONE_COMMIT_SHA
LABEL org.label-schema.version=$DRONE_TAG

RUN set -x && \
    apk --no-cache add \
		nodejs \
		npm \
        curl \
		supervisor && \
	echo "*/5       *       *       *       *       run-parts /etc/periodic/5min" >> /etc/crontabs/root

COPY docker/crons/schedule /etc/periodic/5min/schedule
COPY docker/supervisord.conf /etc/supervisor/supervisord.conf

COPY ./ /var/app
WORKDIR /var/app

RUN chmod a+x /etc/periodic/5min/schedule && \
	echo "Installing dependencies..." && \
	cd /var/app && \
	npm install

ENV DATA_DIR /data

VOLUME /data

ENTRYPOINT [ "/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf" ]
