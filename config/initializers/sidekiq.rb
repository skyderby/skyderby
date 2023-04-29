Sidekiq.configure_server do |config|
  config.redis = {
    url: "redis://#{ENV.fetch('REDIS_HOST', nil)}:#{ENV.fetch('REDIS_PORT', nil)}/#{ENV.fetch('REDIS_DB', nil)}"
  }
end

Sidekiq.configure_client do |config|
  config.redis = {
    url: "redis://#{ENV.fetch('REDIS_HOST', nil)}:#{ENV.fetch('REDIS_PORT', nil)}/#{ENV.fetch('REDIS_DB', nil)}"
  }
end
