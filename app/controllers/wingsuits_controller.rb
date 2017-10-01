# encoding: utf-8

class WingsuitsController < ApplicationController
  before_action :set_wingsuit, only: [:show, :edit, :update, :destroy]

  load_and_authorize_resource

  def index
    @suits = Suits::Index.for(params)

    respond_to do |format|
      format.html
      format.js
    end
  end

  def show
    @tracks = Track.accessible_by(current_user)
    @tracks = TrackFilter.new(show_params[:query]).apply(@tracks)
    @tracks =
      @tracks
      .where(wingsuit: @wingsuit)
      .accessible_by(current_user)
      .order(recorded_at: :desc)
      .includes(
        :pilot,
        :distance,
        :time,
        :speed,
        :video,
        place: :country
      ).paginate(page: params[:page], per_page: 50)
  end

  def new
    @wingsuit = Wingsuit.new
  end

  def edit; end

  def create
    @wingsuit = Wingsuit.new(wingsuit_params)

    if @wingsuit.save
      redirect_to @wingsuit, notice: 'Wingsuit was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    if @wingsuit.update(wingsuit_params)
      redirect_to @wingsuit, notice: 'Wingsuit was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    @wingsuit.destroy
    redirect_to wingsuits_url
  end

  private

  def index_params
    params.permit(:manufacturer_id)
  end
  helper_method :index_params

  def show_params
    params.permit(:order, :page, query: [:kind])
  end
  helper_method :show_params

  def set_wingsuit
    @wingsuit = Wingsuit.includes(:manufacturer).find(params[:id])
  end

  def wingsuit_params
    params.require(:wingsuit).permit(
      :name,
      :manufacturer_id,
      :kind,
      :photo,
      :description
    )
  end
end
