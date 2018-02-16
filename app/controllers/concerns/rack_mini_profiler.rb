module RackMiniProfiler
  extend ActiveSupport::Concern

  included do
    before_action :mini_profiler
  end

  def mini_profiler
    Rack::MiniProfiler.authorize_request if current_user.has_role? :admin
  end
end
