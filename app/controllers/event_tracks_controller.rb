# encoding: utf-8
class EventTracksController < ApplicationController
  before_action :set_event_track, only: [:update, :destroy]

  load_resource :event
  before_filter :authorize_event

  load_and_authorize_resource :event_track, through: :event

  def create
    @event_track = @event.event_tracks.new event_track_params
    @event_track.current_user = current_user

    if @event_track.save
      @event_track
    else
      render json: @event_track.errors, status: :unprocessible_entry
    end
  end

  def update
    @event_track.update round_track_params
    respond_with @event_track
  end

  def destroy
    @event_track.destroy
    head :no_content
  end

  private

  def set_event_track
    @event_track = EventTrack.find(params[:id])
  end

  def event_track_params
    params.require(:event_track).permit(
      :competitor_id,
      :round_id,
      :track_id,
      track_attributes: [
        :file,
        :user_profile_id,
        :place_id,
        :wingsuit_id
      ]
    )
  end

  def authorize_event
    authorize! :update, @event
  end
end
