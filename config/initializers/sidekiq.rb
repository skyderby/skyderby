redis_host = Rails.application.credentials.dig(:redis, :host) || ENV.fetch('REDIS_HOST', nil)
redis_port = Rails.application.credentials.dig(:redis, :port) || ENV.fetch('REDIS_PORT', nil)
redis_url = "redis://#{redis_host}:#{redis_port}/#{ENV.fetch('REDIS_DB', nil)}"

Sidekiq.configure_server do |config|
  config.redis = { url: redis_url }
end

Sidekiq.configure_client do |config|
  config.redis = { url: redis_url }
end
