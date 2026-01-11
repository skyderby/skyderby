class TrackFilesController < ApplicationController
  def new
    @form = Track::Form.new(user: current_user)

    respond_to do |format|
      format.html { redirect_to root_path }
      format.turbo_stream
    end
  end

  def create
    authorize Track

    @track_file = Track::File.new(track_file_params)

    unless @track_file.save
      respond_with_errors @track_file
      return
    end

    if @track_file.one_segment?
      @track = build_track
      current_user.tracks << @track.id unless current_user.registered?

      redirect_to track_path(@track)
    else
      render :show
    end
  end

  def show
    @track_file = Track::File.find(params[:track_file_id])
  end

  private

  def build_track
    track_attributes = track_file_params[:track_attributes].merge(
      track_file: @track_file,
      owner: (current_user if current_user.registered?)
    )

    CreateTrackService.call(track_attributes)
  end

  def track_file_params
    params.require(:track_file).permit(
      :file,
      track_attributes: [
        :name,
        :kind,
        :location,
        :place_id,
        :missing_suit_name,
        :suit_id,
        :comment,
        :visibility
      ]
    )
  end
  helper_method :track_file_params
end
