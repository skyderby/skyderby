ruby '3.1.2'
source 'https://rubygems.org'

gem 'rails', '~> 7.0.3'

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
gem 'nokogiri', '~> 1.14'

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

gem 'shakapacker', '6.5.0'

gem 'matrix'

gem 'vincenty_distance'

group :development do
  gem 'annotate'
  gem 'rubocop', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
end

group :development, :test do
  gem 'byebug'
  gem 'dotenv-rails'
  gem 'factory_bot_rails'
  gem 'rspec'
  gem 'rspec-rails', '~> 5.0.0'
end

group :test do
  gem 'capybara'
  gem 'cuprite'
  gem 'selenium-webdriver', '>= 4.0.0'
  gem 'simplecov'
end
