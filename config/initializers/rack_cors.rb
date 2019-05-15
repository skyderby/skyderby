Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'
    resource '/api/*', headers: 'authorization', methods: [:get, :post, :options]
  end
end
