ruby '3.2.3'
source 'https://rubygems.org'

gem 'rails', '~> 7.1.5'

gem 'ffi'
gem 'puma', '< 7'
gem 'rack-cors'
gem 'thruster', require: false

# DB
gem 'pg', '~> 1.5'
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
gem 'jbuilder', '~> 2.6'
gem 'kramdown'

# Files attachments
gem 'aws-sdk-s3'
gem 'image_processing', '~> 1.12'
gem 'shrine', '~> 3.0'

# XML
gem 'nokogiri', '~> 1.16'

# Background jobs
gem 'sidekiq', '< 7'
gem 'sidekiq-cron', '~> 2.0'

# Export to Excel
gem 'caxlsx'
gem 'caxlsx_rails'

# Exception notifications and profiling
group :production do
  gem 'honeybadger'
  gem 'skylight'
end

# Internalization
gem 'http_accept_language'
gem 'i18n-js'
gem 'listen'

gem 'browser'

# Assets
gem 'bootstrap-sass', '~> 3.4.1'
gem 'font-awesome-sass', '~> 5.8.1'
gem 'sassc-rails'
gem 'shakapacker', '6.5.0'
gem 'terser'
gem 'turbo-rails'

gem 'matrix'
gem 'vincenty_distance'

gem 'net-imap', require: false
gem 'net-pop', require: false
gem 'net-smtp', require: false

group :development do
  gem 'annotate'
  gem 'bullet'
  gem 'kamal', '~> 2.5'
  gem 'rubocop', require: false
  gem 'rubocop-minitest', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
end

group :development, :test do
  gem 'dotenv-rails'
  gem 'factory_bot_rails'
end

group :test do
  gem 'capybara'
  gem 'codeclimate-test-reporter', require: false
  gem 'selenium-webdriver'
  gem 'simplecov'
  gem 'vcr'
  gem 'webmock'
end
