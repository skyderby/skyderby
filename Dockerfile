FROM ruby:2.3

MAINTAINER Aleksandr Kunin <skyksandr@gmail.com>

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        nodejs \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

RUN echo "gem: --no-rdoc --no-ri" >> ~/.gemrc

ENV RAILS_ENV production
ENV LISTEN_ON 8000

WORKDIR /tmp
COPY ./Gemfile Gemfile
COPY ./Gemfile.lock Gemfile.lock
RUN bundle install --without development test --jobs 20 --retry 5

RUN mkdir -p /opt/app \
	&& mkdir -p /tmp/pids \
	&& mkdir -p /tmp/sockets
WORKDIR /opt/app
COPY ./ /opt/app

RUN DATABASE_URL=postgres://user:pass@127.0.0.1/does_not_exist_dbname /bin/sh -c 'bundle exec rake assets:precompile'

VOLUME /opt/app/public/assets
VOLUME /opt/app/public

CMD rake db:migrate \
  && rm -rf /opt/app/tmp/pids/unicorn.pid \
  && bundle exec unicorn -c config/unicorn.rb
