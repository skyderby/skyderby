module Api
  module V1
    class IdentitiesController < Api::ApplicationController
      before_action -> { doorkeeper_authorize! }, only: :index
      before_action -> { doorkeeper_authorize! :write }, only: %i[create destroy]
      before_action :require_registered_user!, :forbid_impersonation!

      rescue_from User::Identity::AppleToken::InvalidToken, GoogleIdToken::InvalidToken do |exception|
        render_errors [exception.message], status: :unauthorized
      end

      def index
        @identities = current_user.identities.chronologically
      end

      def create
        @identity = link_identity
        return render_errors(['Unsupported provider'], status: :unprocessable_content) unless @identity

        if @identity.errors.empty?
          render :show, status: :created
        else
          render_errors @identity.errors.full_messages, status: :unprocessable_content
        end
      end

      def destroy
        identity = current_user.identities.find(params[:id])

        if identity.removable?
          identity.revoke_apple_token
          identity.destroy!
          head :no_content
        else
          render_errors [I18n.t('accounts.identities.last_identity')], status: :unprocessable_content
        end
      end

      private

      def link_identity
        case params[:provider].to_s
        when User::Identity::APPLE
          current_user.link_apple_identity(apple_token, authorization_code: params[:authorization_code])
        when User::Identity::GOOGLE
          current_user.link_identity(User::Identity::GoogleToken.verify(params.require(:identity_token)))
        end
      end

      def apple_token = User::Identity::AppleToken.verify(params.require(:identity_token))
    end
  end
end
