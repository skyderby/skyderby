module Api
  module V1
    class AppleSessionsController < Api::ApplicationController
      APPLICATION_UID = 'skyderby-apple'.freeze
      SCOPES = 'read write'.freeze

      rescue_from User::Identity::AppleToken::InvalidToken do |exception|
        render_errors [exception.message], status: :unauthorized
      end

      rescue_from ActiveRecord::RecordInvalid do |exception|
        render_errors exception.record.errors.full_messages, status: :unprocessable_content
      end

      def create
        user = User.from_identity(apple_token.identity_attributes)
        created = user.nil?

        if created
          return render_not_found unless create_requested?

          user = User.create_with_identity!(apple_token.identity_attributes, name: profile_name)
        end

        store_refresh_token(user)
        render json: token_body(user).merge('created' => created, 'private_email' => apple_token.private_email?)
      end

      private

      def apple_token
        @apple_token ||= User::Identity::AppleToken.verify(params.require(:identity_token))
      end

      def create_requested? = ActiveModel::Type::Boolean.new.cast(params[:create]) || false

      def render_not_found
        render json: { status: 'not_found', private_email: apple_token.private_email? }, status: :not_found
      end

      def profile_name
        name = [params[:given_name], params[:family_name]].compact_blank.join(' ')
        return name if name.present?
        return apple_token.email.split('@').first if apple_token.email.present? && !apple_token.private_email?

        User::Omniauth::DEFAULT_PROFILE_NAME
      end

      def store_refresh_token(user)
        user.identities.find_by!(provider: User::Identity::APPLE, uid: apple_token.uid)
            .store_apple_refresh_token(params[:authorization_code], client_id: apple_token.client_id)
      end

      def token_body(user)
        token = Doorkeeper::AccessToken.create!(
          application: Doorkeeper::Application.find_by!(uid: APPLICATION_UID),
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
end
