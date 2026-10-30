module Api
  module V1
    class AppleSessionsController < Api::ApplicationController
      include Api::NativeSession

      APPLICATION_UID = 'skyderby-apple'.freeze

      rescue_from User::Identity::AppleToken::InvalidToken do |exception|
        render_errors [exception.message], status: :unauthorized
      end

      def create
        user = User.from_identity(apple_token.identity_attributes)
        created = user.nil?

        if created
          return render_not_found(private_email: apple_token.private_email?) unless create_requested?

          user = User.create_with_identity!(apple_token.identity_attributes, name: profile_name)
        end

        store_refresh_token(user)
        render_session(user, created:, private_email: apple_token.private_email?)
      end

      private

      def apple_token
        @apple_token ||= User::Identity::AppleToken.verify(params.require(:identity_token))
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
    end
  end
end
