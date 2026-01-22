class BadgesController < ApplicationController
  before_action :set_badge, only: %i[edit update destroy]

  def index
    return respond_not_authorized unless Badge.viewable?

    @badges =
      Badge
      .includes(:profile)
      .left_outer_joins(:profile)
      .order('profiles.name', 'achieved_at desc')
      .page(page).per(25)
  end

  def new
    return respond_not_authorized unless Badge.creatable?

    @badge = Badge.new
  end

  def create
    return respond_not_authorized unless Badge.creatable?

    @badge = Badge.new(badge_params)

    if @badge.save
      render
    else
      respond_with_errors @badge
    end
  end

  def edit
    authorize @badge

    respond_to do |format|
      format.turbo_stream
    end
  end

  def update
    return respond_not_authorized unless @badge.editable?

    if @badge.update(badge_params)
      respond_to do |format|
        format.turbo_stream
      end
    else
      respond_with_errors @badge
    end
  end

  def destroy
    return respond_not_authorized unless @badge.editable?

    if @badge.destroy
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.remove(@badge) }
      end
    else
      respond_with_errors @badge
    end
  end

  private

  def set_badge
    @badge = Badge.find(params[:id])
  end

  def badge_params
    params.require(:badge).permit(:name, :kind, :category, :comment, :achieved_at, :profile_id)
  end
end
