FROM ruby:2.6.2

MAINTAINER Aleksandr Kunin <skyksandr@gmail.com>

RUN apt-get update -qq && apt-get install -y -qq apt-transport-https ca-certificates \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && curl -sL https://deb.nodesource.com/setup_6.x | bash - \
    && apt-get install -y -qq --no-install-recommends postgresql-client nodejs yarn \
    && rm -rf /var/lib/apt/lists/*

RUN echo "gem: --no-rdoc --no-ri" >> ~/.gemrc

ENV RAILS_ENV production
ENV NODE_ENV production

ENV LISTEN_ON 8000

WORKDIR /tmp
COPY ./Gemfile Gemfile
COPY ./Gemfile.lock Gemfile.lock
RUN bundle install --without development test --jobs 20 --retry 5

WORKDIR /opt/app
COPY ./package.json package.json
COPY ./yarn.lock yarn.lock
RUN yarn

RUN mkdir -p /opt/app \
	&& mkdir -p /tmp/pids \
	&& mkdir -p /tmp/sockets
COPY ./ /opt/app

RUN DATABASE_URL=postgres://user:pass@127.0.0.1/does_not_exist_dbname /bin/sh -c 'bundle exec rake assets:precompile' && \
      rm -rf node_modules

VOLUME /opt/app/public/assets
VOLUME /opt/app/public/packs
VOLUME /opt/app/public

CMD rake db:migrate \
  && bundle exec puma -C config/puma.rb
