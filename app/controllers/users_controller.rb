# encoding: utf-8
class UsersController < ApplicationController
  before_action :set_user, only: [:show, :edit, :update]

  def index
    # User.joins("LEFT OUTER JOIN (#{subquery}) subquery ON users.id = subquery.user_id").select('IFNULL(subquery.result, 0) time', 'users.id').each{ |x| puts x[:id].to_s + ' - ' + x[:time].to_s }
    time_subquery = TrackResult.where(discipline: 0).joins(:track).select('MAX(result) result', 'tracks.user_id').group('tracks.user_id').to_sql
    distance_subquery = TrackResult.where(discipline: 1).joins(:track).select('MAX(result) result', 'tracks.user_id').group('tracks.user_id').to_sql
    speed_subquery = TrackResult.where(discipline: 2).joins(:track).select('MAX(result) result', 'tracks.user_id').group('tracks.user_id').to_sql
    @users = User.includes()
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
