ruby '3.1.2'
source 'https://rubygems.org'

gem 'rails', '~> 6.0.3'

gem 'puma', '< 6'
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
gem 'kramdown'

# Files attachments
gem 'aws-sdk-s3'
gem 'image_processing', '~> 1.12'
gem 'shrine', '~> 3.0'

# XML
gem 'nokogiri', '~> 1.13'
gem 'psych', '< 4'

# Background jobs
gem 'sidekiq', '< 7'
gem 'sidekiq-cron', '~> 1.0'

# Export to Excel
gem 'caxlsx'
gem 'caxlsx_rails'

# Exception notifications and profiling
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
gem 'webpacker', '~> 4.0'

gem 'vincenty_distance'

group :development do
  gem 'annotate'
  gem 'bullet'
  gem 'rubocop', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
end

group :development, :test do
  gem 'byebug'
  gem 'dotenv-rails'
  gem 'factory_bot_rails'
  gem 'rspec'
  gem 'rspec-rails', '~> 4.0.0'
end

group :test do
  gem 'capybara'
  gem 'codeclimate-test-reporter', require: false
  gem 'selenium-webdriver'
  gem 'simplecov'
end
