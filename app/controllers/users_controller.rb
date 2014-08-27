# encoding: utf-8
class UsersController < ApplicationController
  before_action :set_user, only: [:show, :edit, :update]

  def autocomplete
    query = params[:query].downcase
    @users = User.search_by_name query
    suggestions = []
    @users.each do |x|
      suggestions << {:value => (x.name), :data => x.id}
    end
    @response = {:query => query, :suggestions => suggestions}.to_json

    respond_to do |format|
      format.json { render :json => @response }
    end
  end

  def show

  end

  def edit
  end

  def update
    @user.update user_params
    redirect_to user_path(@user)
  end

  private

    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params.require(:user).permit(:first_name, :last_name)
    end
end
