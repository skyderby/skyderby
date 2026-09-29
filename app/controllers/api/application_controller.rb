module Api
  class ApplicationController < ::ApplicationController
    skip_before_action :verify_authenticity_token
    prepend_before_action :reject_invalid_token

    rescue_from ActiveRecord::RecordNotFound do
      render_errors ['Not found'], status: :not_found
    end

    rescue_from ActionController::ParameterMissing do |exception|
      render_errors [exception.message], status: :bad_request
    end

    helper_method :impersonation

    def current_user
      return super unless token_authenticated?

      @current_user ||= User.find_by(id: doorkeeper_token.resource_owner_id) || GuestUser.new(cookies)
    end

    private

    def current_resource_owner
      current_user if token_authenticated?
    end

    def token_authenticated?
      return false unless doorkeeper_token&.accessible?

      impersonation.nil? || impersonation.active?
    end

    def impersonation
      return @impersonation if defined?(@impersonation)

      @impersonation = doorkeeper_token && Impersonation.find_by(access_token_id: doorkeeper_token.id)
    end

    def forbid_impersonation!
      respond_not_authorized if impersonation
    end

    def require_admin!
      respond_not_authorized unless token_authenticated? && current_user.admin?
    end

    def reject_invalid_token
      return if token_authenticated?
      return if request.authorization.blank? && doorkeeper_token.nil?

      render_errors ['Invalid or expired access token'], status: :unauthorized
    end

    def require_registered_user!
      return if current_user.registered?

      render_errors ['Authentication required'], status: :unauthorized
    end

    def respond_not_authorized
      render_errors ['Forbidden'], status: :forbidden
    end

    def render_errors(errors, status:)
      render json: { errors: Array(errors) }, status:
    end

    def doorkeeper_unauthorized_render_options(error: nil)
      { json: { errors: [error&.description.presence || 'Authentication required'] } }
    end

    def doorkeeper_forbidden_render_options(error: nil)
      { json: { errors: [error&.description.presence || 'Forbidden'] } }
    end
  end
end
