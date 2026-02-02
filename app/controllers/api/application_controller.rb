module Api
  class ApplicationController < ::ApplicationController
    skip_before_action :verify_authenticity_token

    private

    def current_resource_owner
      @current_resource_owner ||= User.find(doorkeeper_token.resource_owner_id) if doorkeeper_token
    end
  end
end
