class TracksController < ApplicationController
  include ChartParams
  include UnitsHelper

  before_action :set_track, only: [:show, :edit, :update, :destroy]

  def index
    authorize Track
  end

  def show
    authorize @track

    process_range if params[:range]

    @track_presenter = Tracks::TrackView.for(@track, params, session)

    respond_to do |format|
      format.html
      format.js
      format.json { @track_data }
    end
  end

  def edit
    authorize @track
  rescue Pundit::NotAuthorizedError
    redirect_to @track
  end

  def update
    authorize @track

    if @track.update(track_params)
      [ResultsJob, OnlineCompetitionJob, WeatherCheckingJob].each do |job|
        job.perform_later(@track.id)
      end

      redirect_to @track
    else
      render action: 'edit'
    end
  end

  def destroy
    authorize @track

    @track.destroy
    redirect_to tracks_url
  end

  rescue_from ActiveRecord::RecordNotFound, Pundit::NotAuthorizedError do |_ex|
    redirect_to tracks_url, notice: t('tracks.index.track_not_found',
                                      id: params[:id])
  end

  private

  def set_track
    @track = Track.includes(
      :pilot,
      { suit: :manufacturer },
      { place: :country },
      :video
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
      :jump_range,
      :missing_suit_name,
      :suit_id,
      :comment,
      :cache_id,
      :track_index,
      :visibility,
      :profile_id,
      :disqualified_from_online_competitions
    )
  end

  def show_params
    params.permit(:range, :f, :t, :charts_mode, :charts_units, 'straight-line')
  end
  helper_method :show_params

  def straight_line_distance
    params['straight-line'] == 'true'
  end
  helper_method :straight_line_distance

  def process_range
    range = params[:range].split(';')
    params[:f] = Distance.new(range.first, altitude_units).truncate
    params[:t] = Distance.new(range.last,  altitude_units).truncate
  end

  def altitude_units
    ChartsPreferences.new(session).unit_system.altitude
  end
end
