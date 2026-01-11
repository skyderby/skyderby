class Users::RegistrationsController < Devise::RegistrationsController
  TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to new_user_registration_path, alert: "Try again later." }
  before_action :configure_sign_up_params, only: [:create]

  def create
    build_resource(sign_up_params)

    unless verify_turnstile
      resource.errors.add(:base, I18n.t('turnstile.errors.verification_failed'))
      clean_up_passwords resource
      set_minimum_password_length
      return render :new, status: :unprocessable_entity
    end

    resource.save
    if resource.persisted?
      if resource.active_for_authentication?
        set_flash_message!(:notice, :signed_up)
        sign_up(resource_name, resource)
        respond_with resource, location: after_sign_up_path_for(resource)
      else
        set_flash_message!(:notice, :"signed_up_but_#{resource.inactive_message}")
        expire_data_after_sign_in!
        respond_with resource, location: after_inactive_sign_up_path_for(resource)
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      render :new, status: :unprocessable_entity
    end
  end

  protected

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [{ profile_attributes: [:name] }])
  end

  def verify_turnstile
    return true if Rails.env.test?
    return true unless ENV['TURNSTILE_SECRET_KEY'].present?

    token = params['cf_turnstile_response']
    return false if token.blank?

    response = Net::HTTP.post_form(
      URI(TURNSTILE_VERIFY_URL),
      secret: ENV['TURNSTILE_SECRET_KEY'],
      response: token,
      remoteip: request.remote_ip
    )

    JSON.parse(response.body)['success']
  rescue StandardError
    false
  end
end
