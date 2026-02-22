class Users::ConfirmationsController < Devise::ConfirmationsController
  include TurnstileVerification

  def create
    unless verify_turnstile
      self.resource = resource_class.new
      resource.errors.add(:base, I18n.t('turnstile.errors.verification_failed'))
      return render :new, status: :unprocessable_content
    end

    self.resource = resource_class.send_confirmation_instructions(resource_params)

    if successfully_sent?(resource)
      flash[:notice] = I18n.t('devise.confirmations.send_instructions')
      redirect_to new_session_path(resource_name)
    else
      render :new, status: :unprocessable_content
    end
  end
end
