module Users
  class OmniauthCallbacksController < Devise::OmniauthCallbacksController
    def google_oauth2
      if current_user.present? && current_user.registered?
        connect_google
      else
        register_google
      end
    end

    def failure
      redirect_to root_path
    end

    private

    def connect_google
      current_user.add_data_from_google(request.env['omniauth.auth'])
      if current_user.save && is_navigational_format?
        set_flash_message(:notice, :success_connect, kind: 'Google')
      elsif is_navigational_format?
        set_flash_message(:alert, :failure_connect, kind: 'Google')
      end
      redirect_to after_sign_in_path_for(current_user)
    end

    def register_google
      @user = User.from_omniauth(request.env['omniauth.auth'])

      if @user.persisted?
        Amplitude.identify(user_id: @user.id, properties: { plan: @user.subscription_plan })
        sign_in_and_redirect @user, event: :authentication, remember: true # this will throw if @user is not activated
        set_flash_message(:notice, :success, kind: 'Google') if is_navigational_format?
      else
        session['devise.google_data'] = request.env['omniauth.auth']
        redirect_to new_user_registration_url
      end
    end
  end
end
