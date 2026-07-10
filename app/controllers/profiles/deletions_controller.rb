class Profiles::DeletionsController < ApplicationController
  before_action :set_profile, :authorize_profile_deletion!

  def new; end

  def create
    user = @profile.owner if delete_user_param && @profile.belongs_to_user?

    ActiveRecord::Base.transaction do
      @profile.destroy!
      user&.destroy!
    end

    redirect_to profiles_path, status: :see_other
  rescue ActiveRecord::RecordNotDestroyed
    render(
      turbo_stream: turbo_stream.append(
        :toasts,
        partial: 'toasts/toast',
        locals: { message: t('.failed'), type: 'error' }
      ),
      status: :unprocessable_content
    )
  end

  private

  def set_profile
    @profile = Profile.find(params[:profile_id])
  end

  def authorize_profile_deletion!
    respond_not_authorized unless @profile.deletable?
  end

  def deletion_params
    params.fetch(:profile_deletion, {}).permit(:delete_user)
  end

  def delete_user_param
    deletion_params[:delete_user] == '1'
  end
end
