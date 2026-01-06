module Users
  class GoogleOneTapController < ApplicationController
    skip_before_action :verify_authenticity_token

    def create
      payload = verify_google_token(params[:credential])

      if payload.nil?
        render json: { error: 'Invalid credential' }, status: :unprocessable_entity
        return
      end

      auth = build_auth_hash(payload)
      user = User.from_omniauth(auth)

      if user.persisted?
        sign_in(user, event: :authentication)
        Amplitude.identify(user_id: user.id, properties: { plan: user.subscription_plan })
        render json: { success: true }
      else
        render json: { error: 'Could not authenticate' }, status: :unprocessable_entity
      end
    end

    private

    def verify_google_token(credential)
      Google::Auth::IDTokens.verify_oidc(
        credential,
        aud: ENV.fetch('GOOGLE_CLIENT_ID', nil)
      )
    rescue Google::Auth::IDTokens::VerificationError
      nil
    end

    def build_auth_hash(payload)
      OpenStruct.new(
        provider: 'google_oauth2',
        uid: payload['sub'],
        info: OpenStruct.new(
          email: payload['email'],
          first_name: payload['given_name'],
          last_name: payload['family_name'],
          image: payload['picture']
        )
      )
    end
  end
end
