module Api
  module NativeSession
    extend ActiveSupport::Concern

    SCOPES = 'read write'.freeze

    included do
      before_action :require_native_application

      rescue_from ActiveRecord::RecordInvalid do |exception|
        render_errors exception.record.errors.full_messages, status: :unprocessable_content
      end
    end

    private

    def create_requested? = ActiveModel::Type::Boolean.new.cast(params[:create]) || false

    def render_not_found(private_email:)
      render json: { status: 'not_found', private_email: }, status: :not_found
    end

    def native_application
      return @native_application if defined?(@native_application)

      @native_application = Doorkeeper::Application.find_by(uid: self.class::APPLICATION_UID)
    end

    def require_native_application
      render_errors ['Sign-in is not available'], status: :service_unavailable unless native_application
    end

    def render_session(user, created:, private_email:)
      render json: token_body(user).merge('created' => created, 'private_email' => private_email)
    end

    def token_body(user)
      token = Doorkeeper::AccessToken.create!(
        application: native_application,
        resource_owner_id: user.id,
        resource_owner_type: user.class.polymorphic_name,
        scopes: SCOPES,
        expires_in: Doorkeeper.config.access_token_expires_in.to_i,
        use_refresh_token: true
      )
      Doorkeeper::OAuth::TokenResponse.new(token).body
    end
  end
end
