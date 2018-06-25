class TrackFilesController < ApplicationController
  def create
    authorize Track

    @track_file = TrackFile.new(track_file_params)

    unless @track_file.save
      render template: 'errors/ajax_errors',
             locals: { errors: @track_file.errors }
      return
    end

    if @track_file.one_segment?
      @track = build_track

      unless current_user.registered?
        current_user.tracks << @track.id
      end
    else
      render :show
    end

    store_recent_values(track_attributes)
  end

  def show
    @track_file = TrackFile.find(params[:track_file_id])
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

  def track_attributes
    track_file_params[:track_attributes]
  end

  def store_recent_values(form_params)
    recent_values = RecentValues.new(cookies)
    # suit can be selected or typed
    # when suit selected suit_id param filled and suit param is not
    # and vice versa - when typed suit_id is blank and suit isn't
    suit_id = form_params[:suit_id]
    if suit_id.present?
      recent_values.add(:suit_id, suit_id)
      recent_values.delete(:suit_name)
    end

    suit_name = form_params[:missing_suit_name]
    if suit_name.present?
      recent_values.add(:suit_name, suit_name)
      recent_values.delete(:suit_id)
    end

    recent_values.add(:name, form_params[:name]) if form_params[:name]
    recent_values.add(:location, form_params[:location])
    recent_values.add(:activity, form_params[:kind])
    recent_values.add(:visibility, form_params[:visibility])
  end
end
