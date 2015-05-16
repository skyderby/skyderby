class BadgesController < ApplicationController
  before_action :set_badge, only: [:show, :edit, :update, :destroy]

  load_and_authorize_resource

  def index
    @badges = Badge.all
  end

  def show
  end

  def new
    @badge = Badge.new
  end

  def edit
  end

  def create
    @badge = Badge.new(badge_params)

    if @badge.save
      redirect_to @badge, notice: 'Badge was successfully created.'
    else
      render action: 'new'
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
    params.require(:badge).permit(:name, :kind, :user_profile_id)
  end
end
