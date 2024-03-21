class Rack::Attack
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip if req.env['warden'].user&.admin?
  end
end
