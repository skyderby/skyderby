class TracksController < ApplicationController
  include ChartParams
  include UnitsHelper

  before_action :set_track, only: [:show, :edit, :update, :destroy]

  def index
    authorize Track

    @tracks = policy_scope(Track.all)

    @tracks = TrackFilter.new(index_params[:query]).apply(@tracks)
    @tracks = TrackOrder.new(index_params[:order]).apply(@tracks)

    rows_per_page = request.variant.include?(:mobile) ? 20 : 50

    @tracks = @tracks
              .left_outer_joins(:time, :distance, :speed)
              .includes(
                :video,
                :pilot,
                :distance,
                :speed,
                :time,
                place: [:country],
                suit: [:manufacturer]
              ).paginate(page: params[:page], per_page: rows_per_page)
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
      :video,
      { suit: :manufacturer },
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

  def index_params
    params.permit(
      :order,
      :page,
      query: [:profile_id, :profile_name, :suit_id, :place_id, :kind, :term]
    )
  end
  helper_method :index_params

  def show_params
    params.permit(:range, :f, :t, :charts_mode, :charts_units)
  end
  helper_method :show_params

  def process_range
    range = params[:range].split(';')
    params[:f] = Distance.new(range.first, altitude_units).truncate
    params[:t] = Distance.new(range.last,  altitude_units).truncate
  end

  def altitude_units
    ChartsPreferences.new(session).unit_system.altitude
  end
end
