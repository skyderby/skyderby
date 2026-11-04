module BearerTokenAuthentication
  extend ActiveSupport::Concern

  included do
    prepend_before_action :authenticate_bearer_token, if: :bearer_token?
  end

  private

  def bearer_token? = request.authorization.to_s.start_with?('Bearer ')

  def authenticate_bearer_token
    token = Doorkeeper.authenticate(request)
    return head(:unauthorized) unless token&.accessible? && token.includes_scope?(:read)

    @bearer_user = User.find_by(id: token.resource_owner_id)
    head(:unauthorized) unless @bearer_user
  end

  def current_user = @bearer_user || super

  def respond_not_authorized
    return head(:forbidden) if bearer_token?

    super
  end
end
