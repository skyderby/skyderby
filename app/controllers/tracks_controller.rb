# encoding: utf-8

class TracksController < ApplicationController
  include PreferencesHelper
  include UnitsHelper

  before_action :set_track, only:
    [:show, :google_maps, :google_earth, :replay, :edit, :update, :destroy]

  def index
    @tracks = Track.accessible_by(current_user)

    apply_filters!
    @tracks = TrackOrder.new(params[:order]).apply(@tracks)

    respond_to do |format|
      format.any(:html, :js) do
        @tracks = @tracks.select(
          %(
            tracks.*,
            time.result AS time_result,
            time.range_from AS time_range_from,
            time.range_to AS time_range_to,
            distance.result AS distance_result,
            distance.range_from AS distance_range_from,
            distance.range_to AS distance_range_to,
            speed.result AS speed_result,
            speed.range_from AS speed_range_from,
            speed.range_to AS speed_range_to
          )
        ).joins(
          %(
            LEFT JOIN track_results AS time
              ON time.track_id = tracks.id AND time.discipline = 0
            LEFT JOIN track_results AS distance
              ON distance.track_id = tracks.id AND distance.discipline = 1
            LEFT JOIN track_results AS speed
              ON speed.track_id = tracks.id AND speed.discipline = 2
          )
        ).includes(
          :video,
          :place,
          :pilot,
          :wingsuit,
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
    # @track_data =
      # Skyderby::Tracks::ChartsData.new(@track, params[:f], params[:t])

    respond_to do |format|
      format.html { LastViewedUpdateWorker.perform_async(@track.id) }
      format.js 
      format.json { @track_data }
    end
  end

  def google_earth
    authorize! :read, @track
    redirect_to @track unless @track.ge_enabled

    @track_data = Skyderby::Tracks::EarthData.new(@track)
  end

  def replay
    authorize! :read, @track
    redirect_to @track unless @track.video

    @track_data = Skyderby::Tracks::ReplayData.new(@track)
  end

  def create
    authorize! :create, Track

    @track = CreateTrackService.new(
      current_user,
      cached_params,
      track_params[:track_index]
    ).execute

    store_recent_values(cached_params)

    redirect_to edit_track_path(@track)
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

  def choose
    authorize! :create, Track

    uploaded_file = track_params[:file]

    if uploaded_file.blank?
      render 'errors/upload_error'
      return
    end

    @track_file = TrackFile.create(file: uploaded_file)

    params[:track].merge!(cache_id: write_params_to_cache, index: 0)

    # Redirect to upload error if track don't contain any segment
    # Redirect to create action if track has only one segment
    if @track_file.segments_empty?
      redirect_to :back
    elsif @track_file.one_segment?
      create
    end
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
    @track = Track.find(params[:id])
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

  def process_range
    range = params[:range].split(';')
    params[:f] = Distance.new(range.first, preferred_altitude_units).truncate
    params[:t] = Distance.new(range.last,  preferred_altitude_units).truncate
  end

  def presenter_class
    return Tracks::TrackPresenter if @track.flysight? || @track.cyber_eye?
    Tracks::RawTrackPresenter
  end

  def cached_params
    @cached_params ||= Rails.cache.read(track_params[:cache_id])
  end

  def write_params_to_cache
    @key = SecureRandom.uuid.to_s
    Rails.cache.write(
      @key,
      track_params.except(:file).merge(track_file_id: @track_file.id)
    )
    @key
  end

  def store_recent_values(from_params)
    recent_values = RecentValues.new(cookies)
    # suit can be selected or typed
    # when suit selected wingsuit_id param filled and suit param is not
    # and vice versa - when typed wingsuit_id is blank and suit isn't
    suit_id = from_params[:wingsuit_id]
    unless suit_id.blank?
      recent_values.add(:suit_id, suit_id)
      recent_values.delete(:suit_name)
    end

    suit_name = from_params[:suit]
    unless suit_name.blank?
      recent_values.add(:suit_name, suit_name)
      recent_values.delete(:suit_id)
    end
  
    recent_values.add(:name, from_params[:name]) if from_params[:name]
    recent_values.add(:location, from_params[:location])
    recent_values.add(:activity, from_params[:kind])
  end

  def apply_filters!
    query = params[:query]

    return unless query

    @tracks = @tracks.where(profile_id: query[:profile_id]) if query[:profile_id]
    @tracks = @tracks.where(wingsuit_id: query[:suit_id]) if query[:suit_id]
    @tracks = @tracks.where(place_id: query[:place_id]) if query[:place_id]

    if query[:kind]
      @tracks = @tracks.base if query[:kind] == 'base'
      @tracks = @tracks.skydive if query[:kind] == 'skydive'
    end

    @tracks = @tracks.search(query[:term]) if query[:term]
  end
end
