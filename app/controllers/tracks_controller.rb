# encoding: utf-8
require 'tracks/views/track_earth_data.rb'
require 'tracks/views/track_maps_data.rb'
require 'tracks/views/track_replay_data.rb'
require 'tracks/views/track_edit_data.rb'
require 'tracks/views/track_charts_data.rb'

class TracksController < ApplicationController

  before_action :set_track, only: 
    [:show, :google_maps, :google_earth, :replay, :edit, :update, :destroy]

  def index
    @tracks = Track.public_track.order('id DESC')
        
    if params[:query]
      if params[:query][:profile_id]
        @tracks = @tracks.where(user_profile_id: params[:query][:profile_id]) 
      end

      @tracks = @tracks.search(params[:query][:term]) if params[:query][:term].present?
    end

    respond_to do |format|
      format.html do
        @tracks = @tracks.includes(:wingsuit)
          .includes(wingsuit: :manufacturer)
          .includes(:time)
          .includes(:distance)
          .includes(:speed)
          .paginate(page: params[:page], per_page: 50)
      end

      format.js do
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
    LastViewedUpdateWorker.perform_async(@track.id)

    @track_data = TrackChartsData.new(@track, params[:f], params[:t])
  end

  def google_maps
    authorize! :read, @track

    @track_data = TrackMapsData.new(@track)
  end

  def google_earth
    authorize! :read, @track
    redirect_to @track unless @track.ge_enabled

    @track_data = TrackEarthData.new(@track)
  end

  def replay
    authorize! :read, @track
    redirect_to @track unless @track.video

    @track_data = TrackReplayData.new(@track)
  end

  def new
    authorize! :create, Track

    flight_data = Rails.cache.read(params[:cache_id])

    @track = Track.new flight_data.except(:data, :ext)
    @track.user = current_user
    @track.pilot = current_user.user_profile if current_user

    @track.trackfile = flight_data.slice(:data, :ext)
    @track.track_index = params[:index].to_i

    if @track.save
      ResultsWorker.perform_async(@track.id)
      VirtualCompWorker.perform_async(@track.id)
      redirect_to edit_track_path(@track)
    else
      redirect_to upload_error_tracks_path
    end
  end

  def edit
    redirect_to @track unless can? :update, @track
    @track_data = TrackEditData.new(@track)
  end

  def create
    authorize! :create, Track
    @track = Track.new(track_params)

    if @track.save
      redirect_to @track, notice: 'Track was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    authorize! :update, @track

    track_upd_params = track_params

    if @track.update(track_upd_params)
      ResultsWorker.perform_async(@track.id)
      VirtualCompWorker.perform_async(@track.id)
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

    require 'nokogiri'

    param_file = params[:track_file]

    # Проверим был ли выбран файл
    if param_file.blank?
      redirect_to upload_error_tracks_path
      return
    end

    @tracklist = []
    track_file = param_file.read

    filename =  param_file.original_filename
    ext = filename.downcase[filename.length - 4..filename.length-1]

    if ext == '.csv' || ext == '.tes'
      @tracklist << 'main'
    elsif ext == '.gpx'
      doc = Nokogiri::XML(track_file)
      doc.root.elements.each do |node|

        if node.node_name.eql? 'trk'
          track_name = ''
          points_count = 0
          h_up = 0
          h_down = 0
          prev_height = nil

          node.elements.each do |node_attr|
            if node_attr.node_name.eql? 'trkseg'
              node_attr.elements.each do |trpoint|
                points_count += 1

                trpoint.elements.each do |point_node|

                  if point_node.name.eql? 'ele'
                    unless prev_height.nil?
                      h_up += (point_node.text.to_f - prev_height) if prev_height < point_node.text.to_f
                      h_down += (prev_height - point_node.text.to_f) if prev_height > point_node.text.to_f
                    end
                    prev_height = point_node.text.to_f
                  end
                end # point node loop
              end # trpoint loop
            elsif node_attr.node_name.eql? 'name'
              track_name = node_attr.text.to_s
            end
          end # track attr loop

          @tracklist << {name: track_name,
                         h_up: h_up.to_i.to_s,
                         h_down: h_down.to_i.to_s,
                         points_count: points_count}
        end # if name.eql? 'trk'
      end # doc root loop
    else
      redirect_to upload_error_tracks_path
      return
    end

    # Проверим, содержит ли файл треки
    if @tracklist.count == 0
      redirect_to :back
      return
    end

    flight_data = {data: track_file, ext: ext,
                   name: params[:name], suit: params[:suit],
                   location: params[:location], kind: params[:kind],
                   comment: params[:comment], wingsuit_id: params[:wingsuit_id]}

    @key = SecureRandom.uuid.to_s
    Rails.cache.write(@key, flight_data)

    # Если трек всего один - страницу выбора пропускаем
    if @tracklist.count == 1
      redirect_to controller: 'tracks', action: 'new',
                  cache_id: @key, index: 0
    end
  end

  def upload_error
  end

  private

  def set_track
    @track = Track.find(params[:id])
  end

  def track_params
    params.require(:track).permit(:name, :kind, :location,
                                  :ff_start, :ff_end, :suit, :wingsuit_id,
                                  :comment, :cache_id, :index, :visibility)
  end
end
