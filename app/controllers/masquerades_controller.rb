class MasqueradesController < ApplicationController
  include MasqueradingHelper

  before_action :authorize_admin

  def new
    session[:admin_id] = current_user.id
    user = User.find(params[:user_id])
    sign_in(user)
    redirect_to root_path, notice: "Now masquerading as #{user.profile.name}"
  end

  def destroy
    user = User.find(session[:admin_id])
    sign_in :user, user
    session[:admin_id] = nil
    redirect_to root_path, notice: 'Stopped masquerading'
  end

  private

  def authorize_admin
    current_user.admin? || masquerading?
  end
end
