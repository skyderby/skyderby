# encoding: utf-8

class TracksController < ApplicationController
  before_action :set_track, only:
    [:show, :google_maps, :google_earth, :replay, :edit, :update, :destroy]

  def index
    @tracks = Track.accessible_by(current_user)

    apply_filters!
    apply_order!

    respond_to do |format|
      format.any(:html, :js) do
        @tracks = @tracks.includes(
          :video,
          :place,
          :pilot,
          :time,
          :distance,
          :speed,
          :wingsuit,
          wingsuit: [:manufacturer]
        ).paginate(page: params[:page], per_page: 50)
      end

      format.json { @tracks }
    end
  end

  def show
    authorize! :read, @track
    @track_data =
      Skyderby::Tracks::ChartsData.new(@track, params[:f], params[:t])

    respond_to do |format|
      format.html do
        LastViewedUpdateWorker.perform_async(@track.id)
        @track_data
      end
      format.json { @track_data }
    end
  end

  def google_maps
    authorize! :read, @track

    @track_data = Skyderby::Tracks::MapsData.new(@track)
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
      :user_profile_id
    )
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

  def apply_filters!
    query = params[:query]

    return unless query

    @tracks = @tracks.where(user_profile_id: query[:profile_id]) if query[:profile_id]
    @tracks = @tracks.where(wingsuit_id: query[:suit_id]) if query[:suit_id]
    @tracks = @tracks.where(place_id: query[:place_id]) if query[:place_id]

    if query[:kind]
      @tracks = @tracks.base if query[:kind] == 'base'
      @tracks = @tracks.skydive if query[:kind] == 'skydive'
    end

    @tracks = @tracks.search(query[:term]) if query[:term]
  end

  def apply_order!
    order = params[:order] || ''
    order_params = order.split(' ')

    order_field = order_params[0] || 'id'
    order_direction = order_params[1] || 'DESC'

    allowed_fields = %w(ID RECORDED_AT)
    allowed_directions = %w(ASC DESC)
    return unless allowed_fields.include?(order_field.upcase) ||
                  allowed_directions.include?(order_direction.upcase)

    @tracks = @tracks.order(order_field + ' ' + order_direction)
  end
end
