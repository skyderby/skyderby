class Users::PasswordsController < Devise::PasswordsController
  def create
    self.resource = resource_class.send_reset_password_instructions(resource_params)

    if successfully_sent?(resource)
      redirect_to new_session_path(resource_name)
    else
      render :new, status: :unprocessable_content
    end
  end
end
