class TrackFilesController < ApplicationController
  def create
    authorize! :create, Track

    @track_file = TrackFile.new(track_file_params)

    unless @track_file.save
      render template: 'errors/ajax_errors',
             locals: {errors: @track_file.errors}
      return
    end

    if @track_file.one_segment?
      @track = build_track
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
      user: current_user 
    )

    CreateTrackService.new(track_attributes).execute
  end

  def track_file_params
    params.require(:track_file).permit(
      :file,
      track_attributes: [
        :name,
        :kind,
        :location,
        :place_id,
        :suit,
        :wingsuit_id,
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
    # when suit selected wingsuit_id param filled and suit param is not
    # and vice versa - when typed wingsuit_id is blank and suit isn't
    suit_id = form_params[:wingsuit_id]
    unless suit_id.blank?
      recent_values.add(:suit_id, suit_id)
      recent_values.delete(:suit_name)
    end

    suit_name = form_params[:suit]
    unless suit_name.blank?
      recent_values.add(:suit_name, suit_name)
      recent_values.delete(:suit_id)
    end
  
    recent_values.add(:name, form_params[:name]) if form_params[:name]
    recent_values.add(:location, form_params[:location])
    recent_values.add(:activity, form_params[:kind])
  end
end
