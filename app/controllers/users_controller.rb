# encoding: utf-8
class UsersController < ApplicationController
  before_action :set_user, only: [:show, :edit, :update]

  def autocomplete

    @response = User.suggestions_by_name params[:query].downcase

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