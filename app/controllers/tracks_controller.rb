# encoding: utf-8

class TracksController < ApplicationController
  before_action :set_track, only:
    [:show, :google_maps, :google_earth, :replay, :edit, :update, :destroy]

  def index
    @tracks = Track.public_track.order('id DESC')

    apply_filters!

    respond_to do |format|
      format.any(:html, :js) do
        @tracks = @tracks.includes(:wingsuit)
                  .includes(wingsuit: :manufacturer)
                  .includes(:time)
                  .includes(:distance)
                  .includes(:speed)
                  .paginate(page: params[:page], per_page: 50)
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

    @track = Track.new cached_params.merge(
      file: File.open(cached_params[:filepath]),
      user: current_user,
      track_index: track_params[:track_index]
    )

    if @track.save
      redirect_to edit_track_path(@track)
    else
      render 'errors/upload_error'
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

  def choose
    authorize! :create, Track

    @tmpfile_path = record_temp_file

    unless @tmpfile_path
      render 'errors/upload_error'
      return
    end

    @tracklist =
      Skyderby::Tracks::FileProcessor.new(@tmpfile_path).read_segments

    params[:track].merge!(cache_id: write_params_to_cache, index: 0)

    # Redirect to upload error if track don't contain any segment
    # Redirect to create action if track has only one segment
    if @tracklist.empty?
      redirect_to :back
    elsif @tracklist.size == 1
      create
    end
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
      :track_file,
      :filepath,
      :ff_start,
      :ff_end,
      :suit,
      :wingsuit_id,
      :comment,
      :cache_id,
      :track_index,
      :visibility
    )
  end

  def cached_params
    @cached_params ||= Rails.cache.read(track_params[:cache_id])
  end

  def write_params_to_cache
    @key = SecureRandom.uuid.to_s
    Rails.cache.write(
      @key,
      track_params.except(:track_file).merge(filepath: @tmpfile_path)
    )
    @key
  end

  def record_temp_file
    uploaded_file = track_params[:track_file]
    return nil if uploaded_file.blank?

    # Tempfile uses to provide uniq filename
    tmp_file = Tempfile.new(['', File.extname(uploaded_file.original_filename)],
                            Rails.root.join('tmp'))

    begin
      uploaded_file.rewind
      tmp_file.binmode
      tmp_file.write uploaded_file.read
      # Make file persist between requests
      # it will be unlinked after track save successfully
      ObjectSpace.undefine_finalizer(tmp_file)
    ensure
      tmp_file.close
    end

    tmp_file.path
  end

  def apply_filters!
    return unless params[:query]

    if params[:query][:profile_id]
      @tracks = @tracks.where(user_profile_id: params[:query][:profile_id])
    end

    @tracks = @tracks.search(params[:query][:term])
  end
end
