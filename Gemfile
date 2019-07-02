ruby '2.6.2'
source 'https://rubygems.org'

gem 'rails', '~> 5.2'

gem 'puma'
gem 'rack-attack'
gem 'rack-cors'

# DB
gem 'pg', '~> 1.0'
gem 'pluck_to_hash'
gem 'scenic'

gem 'bootsnap', require: false

# Auth
gem 'devise'
gem 'omniauth-facebook'

# Authorization
gem 'pundit'

# Pagination
gem 'will_paginate'
gem 'will_paginate-bootstrap'

# Template engines
gem 'haml'
gem 'jbuilder', '~> 2.6'

# Files attachments
gem 'paperclip', '~> 6.0'

# XML
gem 'nokogiri', '~> 1.8'

# Background jobs
gem 'sidekiq', ' < 6'
gem 'sidekiq-cron', '~> 1.0'

# Export to Excel
gem 'axlsx', '3.0.0.pre'
gem 'axlsx_rails'

# Exception notifications and profiling
gem 'rack-mini-profiler'
group :production do
  gem 'honeybadger', '~> 4.0'
  gem 'skylight'
end

# Internalization
gem 'http_accept_language'
gem 'i18n-js', '>= 3.0.0.rc8'

gem 'browser'

# Assets
gem 'bootstrap-sass', '~> 3.4.1'
gem 'font-awesome-sass', '~> 5.8.1'
gem 'sassc-rails'
gem 'turbolinks'
gem 'uglifier', '>= 2.7.2'
gem 'webpacker', '~> 3.4'

gem 'vincenty_distance'

group :development do
  gem 'annotate'
  gem 'bullet'
  gem 'meta_request'
  gem 'rubocop', require: false
  gem 'rubocop-rails', require: false
end

group :development, :test do
  gem 'byebug'
  gem 'dotenv-rails'
  gem 'factory_bot_rails'
  gem 'pry-rails'
  gem 'rspec'
  gem 'rspec-rails'
end

group :test do
  gem 'capybara'
  gem 'codeclimate-test-reporter', require: false
  gem 'selenium-webdriver'
  gem 'simplecov'
end
