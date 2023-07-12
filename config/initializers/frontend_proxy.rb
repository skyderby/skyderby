ENV['FRONTEND_URL'] ||= 'http://localhost:3001'

class FrontendProxy < Rack::Proxy
  def perform_request(env)
    request = Rack::Request.new(env)

    # use rack proxy for anything hitting our host app at /example_service
    if %r{^(/api|/assets).*}.match?(request.path)
      @app.call(env)
    else
      backend = URI(ENV['FRONTEND_URL'])
      # most backends required host set properly, but rack-proxy doesn't set this for you automatically
      # even when a backend host is passed in via the options
      env['HTTP_HOST'] = backend.host
      env['SERVER_PORT'] = backend.port

      # This is the only path that needs to be set currently on Rails 5 & greater
      env['PATH_INFO'] = request.path
      env['REQUEST_PATH'] = ENV['FRONTEND_URL'] + request.path

      super(env)
    end
  end

  def rewrite_response(triplet)
    status, headers, body = triplet

    # if you proxy depending on the backend, it appears that content-length isn't calculated correctly
    # resulting in only partial responses being sent to users
    # you can remove it or recalculate it here
    headers['content-length'] = nil

    triplet
  end
end

if Rails.env.test?
  Rails.application.config.middleware.use FrontendProxy, { ssl_verify_none: true, backend: ENV['FRONTEND_URL'] }
end
