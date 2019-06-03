class Rack::Attack
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  throttle('req/ip', limit: 300, period: 5.minutes) do |req| # rubocop:disable Style/SymbolProc
    req.ip
  end
end
