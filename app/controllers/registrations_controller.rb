class RegistrationsController < Devise::RegistrationsController

  def update

    # required for settings form to submit when password is left blank
    if account_update_params[:password].blank?
      [:password,:password_confirmation,:current_password].collect{|p| account_update_params.delete(p) }
    end
    if account_update_params[:password].present? and account_update_params[:current_password].blank?
      [:current_password].collect{|p| account_update_params.delete(p) }
    end

    @user = User.find(current_user.id)

    @prev_unconfirmed_email = @user.unconfirmed_email if @user.respond_to?(:unconfirmed_email)

    successfully_updated = if needs_password?(@user, params)
                             @user.update_with_password(devise_parameter_sanitizer.sanitize(:account_update))
                           else
                             # remove the virtual current_password attribute
                             # update_without_password doesn't know how to ignore it
                             params[:user].delete(:current_password)
                             @user.update_without_password(devise_parameter_sanitizer.sanitize(:account_update))
                           end

    if successfully_updated
      if is_flashing_format?
        flash_key = update_needs_confirmation?(@user, @prev_unconfirmed_email) ?
            :update_needs_confirmation : :updated
        set_flash_message :notice, flash_key
      end
      # Sign in the user bypassing validation in case their password changed
      sign_in @user, :bypass => true
      redirect_to after_update_path_for(@user)
    else
      render 'edit'
    end

  end

  protected

  def update_resource(resource, params)
    resource.update_attributes(params)
  end

  private

  def sign_up_params
    params.require(:user).permit(:first_name, :last_name, :email, :password, :password_confirmation)
  end

  def account_update_params
    params.require(:user).permit(:first_name, :last_name, :email, :password, :password_confirmation, :current_password)
  end

  # check if we need password to update user data
  # ie if password or email was changed
  # extend this as needed
  def needs_password?(user, params)
    user.email != params[:user][:email] ||
        params[:user][:password].present?
  end

end
