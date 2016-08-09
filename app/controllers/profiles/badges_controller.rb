# encoding: utf-8
class Profiles::BadgesController < ApplicationController
  before_action :set_badge, only: [:show, :edit, :update, :destroy]

  load_resource :profile
  load_and_authorize_resource

  respond_to :js

  def index
    @badges = Badge.all
  end

  def show
  end

  def new
    @badge = @profile.badges.new
  end

  def edit
  end

  def create
    @badge = @profile.badges.new(badge_params)

    unless @badge.save
      render 'errors/ajax_errors', locals: {errors: @badge.errors}
    end
  end

  def update
    if @badge.update(badge_params)
      redirect_to @badge, notice: 'Badge was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    @badge.destroy
    redirect_to badges_url
  end

  private

  def set_badge
    @badge = Badge.find(params[:id])
  end

  def badge_params
    params.require(:badge).permit(:name, :kind, :profile_id)
  end
end
