FROM ruby:3.0.0

MAINTAINER Aleksandr Kunin <skyksandr@gmail.com>
LABEL org.opencontainers.image.source=https://github.com/skyderby/skyderby

RUN apt-get update -qq && apt-get install -y -qq apt-transport-https ca-certificates \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y -qq --no-install-recommends postgresql-client nodejs yarn \
    && rm -rf /var/lib/apt/lists/*

RUN echo "gem: --no-rdoc --no-ri" >> ~/.gemrc

ENV RAILS_ENV=production NODE_ENV=production

WORKDIR /tmp
COPY ./Gemfile Gemfile
COPY ./Gemfile.lock Gemfile.lock
RUN bundle config set --local without 'development test' && bundle install --jobs 20 --retry 5

WORKDIR /opt/app
COPY ./package.json package.json
COPY ./yarn.lock yarn.lock
RUN yarn install --production

RUN mkdir -p /opt/app \
  && mkdir -p /tmp/pids \
  && mkdir -p /tmp/sockets
COPY ./ /opt/app

RUN SECRET_KEY_BASE=just-for-precompilation \
  /bin/sh -c 'bundle exec rails assets:precompile' && \
  rm -rf node_modules

VOLUME /opt/app/public/assets
VOLUME /opt/app/public/packs
VOLUME /opt/app/public

CMD rails db:migrate && bundle exec puma -C config/puma.rb
