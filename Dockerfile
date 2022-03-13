FROM alpine:3.13

ARG BUILD_DATE

LABEL maintainer="kristopherwilson@gmail.com"

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.build-date=$BUILD_DATE
LABEL org.label-schema.name="mrkrstphr/file-processor"
LABEL org.label-schema.description="Processes files"
LABEL org.label-schema.url="https://github.com/mrkrstphr/file-processor"
LABEL org.label-schema.vcs-url="https://github.com/mrkrstphr/file-processor"
LABEL org.label-schema.vcs-ref=$VCS_REF
LABEL org.label-schema.version=$BUILD_VERSION

RUN set -x && \
    apk --no-cache add \
		nodejs \
		npm \
        curl \
		supervisor && \
	echo "*       *       *       *       *       run-parts /etc/periodic/1min" >> /etc/crontabs/root

COPY docker/crons/schedule /etc/periodic/1min/schedule

RUN chmod a+x /etc/periodic/1min/schedule && \
	RELEASE_VERSION=$(curl -sX GET "https://api.github.com/repos/mrkrstphr/file-processor/releases/latest" | awk '/tag_name/{print $4;exit}' FS='[""]') && \
    curl -o app.tar.gz -fSL "https://github.com/mrkrstphr/file-processor/archive/${RELEASE_VERSION}.tar.gz" && \
    tar -xzf app.tar.gz --strip-components 1 -C /var/app && \
    rm -rf app.tar.gz && \
	echo "Installing dependencies..." && \
	npm install

COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

VOLUME /data

CMD ["/usr/bin/supervisord" "-c" "/etc/supervisor/conf.d/supervisord.conf"]
