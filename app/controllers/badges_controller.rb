class BadgesController < ApplicationController
  before_action :set_badge, only: [:show, :edit, :update, :destroy]

  def index
    authorize! :read, @badge
    @badges = Badge.all
  end

  def show
    authorize! :read, @badge
  end

  def new
    authorize! :create, :badge
    @badge = Badge.new
  end

  def edit
    authorize! :update, @badge
  end

  def create
    authorize! :create, :badge
    @badge = Badge.new(badge_params)

    if @badge.save
      redirect_to @badge, notice: 'Badge was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    authorize! :update, @badge

    if @badge.update(badge_params)
      redirect_to @badge, notice: 'Badge was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    authorize! :destroy, @badge

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
