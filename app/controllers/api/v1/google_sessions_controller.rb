module Api
  module V1
    class GoogleSessionsController < Api::ApplicationController
      include Api::NativeSession

      APPLICATION_UID = 'skyderby-android'.freeze

      rescue_from GoogleIdToken::InvalidToken do |exception|
        render_errors [exception.message], status: :unauthorized
      end

      def create
        user = User.from_identity(google_token.identity_attributes)
        created = user.nil?

        if created
          return render_not_found(private_email: false) unless create_requested?

          user = User.create_with_identity!(google_token.identity_attributes, name: profile_name, userpic:)
        end

        render_session(user, created:, private_email: false)
      end

      private

      def google_token
        @google_token ||= User::Identity::GoogleToken.verify(params.require(:id_token))
      end

      def profile_name
        name = [google_token.given_name, google_token.family_name].compact_blank.join(' ')
        return name if name.present?
        return google_token.email.split('@').first if google_token.email.present?

        User::Omniauth::DEFAULT_PROFILE_NAME
      end

      def userpic
        User.remote_userpic(google_token.picture)
      rescue OpenURI::HTTPError, SocketError, SystemCallError, Timeout::Error, URI::InvalidURIError,
             OpenSSL::SSL::SSLError, Net::HTTPBadResponse
        nil
      end
    end
  end
end
