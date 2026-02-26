# frozen_string_literal: true

Doorkeeper.configure do
  orm :active_record

  resource_owner_authenticator do
    current_user || warden.authenticate!(scope: :user)
  end

  admin_authenticator do
    current_user&.admin? || redirect_to(new_user_session_path)
  end

  access_token_expires_in 1.day
  use_refresh_token

  default_scopes :read
  optional_scopes :write

  enforce_configured_scopes

  use_polymorphic_resource_owner

  grant_flows %w[authorization_code]

  force_ssl_in_redirect_uri { |uri| !Rails.env.development? && uri.host != 'localhost' }

  allow_blank_redirect_uri false

  skip_authorization do |_resource_owner, client|
    client.application.scopes.blank?
  end

  handle_auth_errors :render
end

Doorkeeper::OAuth::AuthorizationCodeRequest.prepend(
  Module.new do
    def pkce_supported?
      true
    end
  end
)
