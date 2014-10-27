# encoding: utf-8
class TracksController < ApplicationController

  before_action :set_track, only: [:show, :google_maps, :google_earth, :edit, :update, :destroy]

  def index
    @tracks = Track.public_track.includes(:wingsuit)
  end

  def show
    authorize! :read, @track
    @track.update(:lastviewed_at => Time.now)
  end

  def google_maps
    authorize! :read, @track
  end

  def google_earth
    unless @track.ge_enabled
      redirect_to track_path(@track)
    end
    authorize! :read, @track
  end

  def new
    authorize! :create, Track

    flight_data = Rails.cache.read(params[:cache_id])

    @track = Track.new flight_data.except(:data, :ext, :ws_id)
    @track.wingsuit = Wingsuit.find(flight_data[:wingsuit_id]) if flight_data[:wingsuit_id].present?
    @track.user = current_user
    @track.ge_enabled = true

    @track.trackfile = flight_data.slice(:data, :ext)
    @track.track_index = params[:index].to_i

    if @track.save
      redirect_to edit_track_path(@track)
    else
      redirect_to upload_error_tracks_path
    end

  end

  def edit
  end

  # POST /tracks
  # POST /tracks.json
  def create
    authorize! :create, Track
    @track = Track.new(track_params)
#
    respond_to do |format|
      if @track.save
        format.html { redirect_to @track, notice: 'Track was successfully created.' }
        format.json { render action: 'show', status: :created, location: @track }
      else
        format.html { render action: 'new' }
        format.json { render json: @track.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /tracks/1
  # PATCH/PUT /tracks/1.json
  def update
    authorize! :update, @track

    track_upd_params = track_params
    #track_upd_params[:wingsuit] = nil
    #track_upd_params[:wingsuit] = Wingsuit.find(track_upd_params[:wingsuit_id]) if track_upd_params[:wingsuit_id].present?

    respond_to do |format|
      if @track.update(track_upd_params)
        format.html { redirect_to @track, notice: 'Track was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @track.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tracks/1
  # DELETE /tracks/1.json
  def destroy
    authorize! :destroy, @track

    @track.destroy
    respond_to do |format|
      format.html { redirect_to tracks_url }
      format.json { head :no_content }
    end
  end

  def choose
    authorize! :create, Track

    require 'nokogiri'

    param_file = params[:track_file]

    # Проверим был ли выбран файл
    if param_file == nil
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

          @tracklist << {:name => track_name,
                         :h_up => h_up.to_i.to_s,
                         :h_down => h_down.to_i.to_s,
                         :points_count => points_count}

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

    flight_data = {:data => track_file, :ext => ext,
                   :name => params[:name], :suit => params[:suit],
                   :location => params[:location], :kind => params[:kind],
                   :comment => params[:comment], :ws_id => params[:wingsuit_id]}

    @key = SecureRandom.uuid.to_s
    Rails.cache.write(@key, flight_data)

    # Если трек всего один - страницу выбора пропускаем
    if @tracklist.count == 1
      redirect_to :controller => 'tracks', :action => 'new',
                  :cache_id => @key, :index => 0
    end
  end

  def upload_error
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_track
      @track = Track.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def track_params
      params.require(:track).permit(:name, :suit, :kind, :location,
                                    :ff_start, :ff_end, :wingsuit_id,
                                    :comment, :cache_id, :index, :visibility)
    end
end
