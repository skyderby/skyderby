module Api
  module NativeSession
    extend ActiveSupport::Concern

    SCOPES = 'read write'.freeze

    included do
      rescue_from ActiveRecord::RecordInvalid do |exception|
        render_errors exception.record.errors.full_messages, status: :unprocessable_content
      end
    end

    private

    def create_requested? = ActiveModel::Type::Boolean.new.cast(params[:create]) || false

    def render_not_found(private_email:)
      render json: { status: 'not_found', private_email: }, status: :not_found
    end

    def render_session(user, application_uid:, created:, private_email:)
      render json: token_body(user, application_uid:).merge('created' => created, 'private_email' => private_email)
    end

    def token_body(user, application_uid:)
      token = Doorkeeper::AccessToken.create!(
        application: Doorkeeper::Application.find_by!(uid: application_uid),
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
