class TracksController < ApplicationController
  include ChartParams
  include UnitsHelper

  before_action :set_track, only: [:show, :edit, :update, :destroy]
  before_action :set_compare_track, only: [:show]

  def index
    @tracks = Track.accessible

    @tracks = TrackFilter.new(index_params).apply(@tracks)

    @tracks = @tracks
              .sorted(*order_params)
              .includes(
                :video,
                :distance,
                :speed,
                :time,
                place: [:country],
                pilot: :owner,
                suit: [:manufacturer]
              ).page(page).per(25)

    respond_to do |format|
      format.html
      format.turbo_stream
      format.json
    end
  end

  def show
    return redirect_to_track_not_found unless @track.viewable?

    respond_to do |format|
      format.html
      format.json
    end
  end

  def edit
    return redirect_to @track unless @track.editable?

    respond_to do |format|
      format.html
    end
  end

  def update
    return redirect_to_track_not_found unless @track.editable?

    if @track.update(track_params)
      [ResultsJob, OnlineCompetitionJob, MissingWeatherFetchingJob].each do |job|
        job.perform_later(@track.id)
      end

      redirect_to @track
    else
      render action: 'edit'
    end
  end

  def destroy
    return redirect_to_track_not_found unless @track.editable?

    if @track.destroy
      redirect_to tracks_url(format: :html), status: :see_other
    else
      respond_with_errors(@track)
    end
  end

  rescue_from ActiveRecord::RecordNotFound do |_ex|
    redirect_to_track_not_found
  end

  private

  def redirect_to_track_not_found
    redirect_to tracks_url, notice: t('tracks.index.track_not_found', id: params[:id])
  end

  def set_track
    @track = Track.includes(
      :pilot,
      { suit: :manufacturer },
      { place: :country },
      :video
    ).find(params[:id])
  end

  def set_compare_track
    return if params[:compare_id].blank?
    return unless @track.pro_view_available?

    @compare_track = viewable_compare_track

    track_compare_event
  end

  def viewable_compare_track
    Track.viewable.find_by(id: params[:compare_id]) ||
      Track.find_by(id: params[:compare_id])&.then { |track| track if track.viewable? }
  end

  def track_compare_event
    return if @compare_track.blank?

    Amplitude.track_later(
      user_id: Current.user.id,
      event: "#{@track.kind}_track_compare_activated",
      properties: {
        track_id: @track.id,
        compare_track_id: @compare_track.id,
        subscription_plan: Current.user.subscription_plan,
        is_own_track: @track.recorded_by? && @compare_track.recorded_by?,
        source: params[:source].presence
      }
    )
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
      :landing_fl_time,
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
      :kind,
      :profile_name,
      :term,
      :profile_id,
      :suit_id,
      :place_id,
      :year,
      :infinite,
      :exclude_id,
      profile_id: [],
      suit_id: [],
      place_id: [],
      year: []
    )
  end
  helper_method :index_params

  def show_params
    params.permit(:range, :f, :t, :charts_mode, :charts_units, 'straight-line', :compare_id)
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
