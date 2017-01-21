# encoding: utf-8

class TracksController < ApplicationController
  include PreferencesHelper
  include UnitsHelper

  before_action :set_track, only: [:show, :edit, :update, :destroy]

  def index
    @tracks = Track.accessible_by(current_user)

    @tracks = TrackFilter.new(index_params[:query]).apply(@tracks)
    @tracks = TrackOrder.new(index_params[:order]).apply(@tracks)

    respond_to do |format|
      format.any(:html, :js) do
        @tracks = @tracks
          .left_outer_joins(:time, :distance, :speed)
          .includes(
          :video,
          :pilot,
          :distance,
          :speed,
          :time,
          place: [:country],
          wingsuit: [:manufacturer]
        ).paginate(page: params[:page], per_page: 50)
      end

      format.json { @tracks }
    end
  end

  def show
    authorize! :read, @track

    process_range if params[:range]

    @track_presenter = presenter_class.new(
      @track,
      params[:f],
      params[:t],
      preferred_speed_units,
      preferred_distance_units,
      preferred_altitude_units
    )
    
    @track_presenter.load

    respond_to do |format|
      format.html { LastViewedUpdateJob.perform_later(@track.id) }
      format.js 
      format.json { @track_data }
    end
  end

  def edit
    redirect_to @track unless can? :update, @track
    @track_data = Skyderby::Tracks::EditData.new(@track)
  end

  def update
    authorize! :update, @track

    if @track.update(track_params)
      redirect_to @track, notice: 'Track was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    authorize! :destroy, @track

    @track.destroy
    redirect_to tracks_url
  end

  rescue_from ActiveRecord::RecordNotFound do |_exception|
    track_not_found
  end

  rescue_from CanCan::AccessDenied do |_exception|
    track_not_found
  end

  def track_not_found
    redirect_to tracks_url, notice: t('tracks.index.track_not_found',
                                      id: params[:id])
  end

  private

  def set_track
    @track = Track.includes(
      :pilot,
      :video,
      { wingsuit: :manufacturer },
      { place: :country }
    ).find(params[:id])
  end

  def track_params
    params.require(:track).permit(
      :name,
      :kind,
      :location,
      :place_id,
      :ground_level,
      :file,
      :track_file_id,
      :filepath,
      :ff_start,
      :ff_end,
      :suit,
      :wingsuit_id,
      :comment,
      :cache_id,
      :track_index,
      :visibility,
      :profile_id
    )
  end

  def index_params
    params.permit(
      :order,
      :page,
      query: [:profile_id, :profile_name, :wingsuit_id, :place_id, :kind, :term]
    )
  end
  helper_method :index_params

  def show_params
    params.permit(:range, :f, :t, :charts_mode, :charts_units) 
  end
  helper_method :show_params

  def process_range
    range = params[:range].split(';')
    params[:f] = Distance.new(range.first, preferred_altitude_units).truncate
    params[:t] = Distance.new(range.last,  preferred_altitude_units).truncate
  end

  def presenter_class
    return Tracks::TrackPresenter if @track.flysight? || @track.cyber_eye?
    Tracks::RawTrackPresenter
  end
end
