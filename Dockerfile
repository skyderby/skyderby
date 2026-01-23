# syntax=docker/dockerfile:1

ARG RUBY_VERSION=4.0.1

FROM ruby:$RUBY_VERSION-slim AS base

LABEL org.opencontainers.image.source=https://github.com/skyderby/skyderby \
      org.opencontainers.image.authors="Aleksandr Kunin <skyksandr@gmail.com>"

WORKDIR /app

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y libjemalloc2 libpq-dev postgresql-client libvips libeccodes-dev curl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV RAILS_ENV=production \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git pkg-config libyaml-dev unzip && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ARG NODE_VERSION=22.16.0
ARG YARN_VERSION=1.22.22
ARG NODE_OPTIONS=--openssl-legacy-provider
ENV PATH=/usr/local/node/bin:$PATH
RUN curl -sL https://github.com/nodenv/node-build/archive/master.tar.gz | tar xz -C /tmp/ && \
    /tmp/node-build-master/bin/node-build "${NODE_VERSION}" /usr/local/node && \
    npm install -g yarn@$YARN_VERSION && \
    rm -rf /tmp/node-build-master

COPY Gemfile Gemfile.lock vendor ./
RUN bundle config build.nio4r --with-cflags="-Wno-incompatible-pointer-types" && \
    bundle config build.msgpack --with-cflags="-Wno-incompatible-function-pointer-types" && \
    bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

COPY package.json yarn.lock ./
RUN yarn install --immutable

COPY . .

RUN SECRET_KEY_BASE_DUMMY=1 bundle exec i18n export && \
    bundle exec bootsnap precompile app/ lib/ && \
    SECRET_KEY_BASE_DUMMY=1 bundle exec rails assets:precompile && \
    rm -rf node_modules

FROM base

RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash
USER rails:rails

COPY --chown=rails:rails --from=build ${BUNDLE_PATH} ${BUNDLE_PATH}
COPY --chown=rails:rails --from=build /app /app

ENTRYPOINT ["/app/bin/docker-entrypoint"]

EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
