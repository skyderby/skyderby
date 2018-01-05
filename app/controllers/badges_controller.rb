class BadgesController < ApplicationController
  before_action :set_badge, only: %i[edit update destroy]

  def index
    authorize Badge

    @badges =
      Badge
      .includes(:profile)
      .left_outer_joins(:profile)
      .order('profiles.name', 'achieved_at desc')
      .paginate(page: params[:page], per_page: 25)
  end

  def edit
    authorize @badge

    respond_to do |format|
      format.js
    end
  end

  def update
    authorize @badge

    respond_to do |format|
      if @badge.update(badge_params)
        format.js
      else
        format.js { render 'errors/ajax_errors', locals: { errors: @badge.errors } }
      end
    end
  end

  def destroy
    authorize @badge

    respond_to do |format|
      if @badge.destroy
        format.js
      else
        format.js { render 'errors/ajax_errors', locals: { errors: @badge.errors } }
      end
    end
  end

  private

  def set_badge
    @badge = Badge.find(params[:id])
  end

  def badge_params
    params.require(:badge).permit(:name,
                                  :kind,
                                  :category,
                                  :comment,
                                  :achieved_at)
  end
end
