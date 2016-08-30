# encoding: utf-8
class Events::EventTracksController < ApplicationController
  include EventLoading
  include UnitsHelper
  include PreferencesHelper

  before_action :set_event_track, only: [:show, :edit, :update, :destroy]

  load_resource :event
  before_filter :authorize_update_event, except: :show
  before_filter :authorize_show_event, only: :show

  load_and_authorize_resource :event_track, through: :event

  def create
    @event_track = @event.event_tracks.new event_track_params
    @event_track.current_user = current_user

    if @event_track.save
      respond_to do |format|
        format.js { respond_with_scoreboard }
      end
    else
      respond_with_errors @event_track.errors
    end
  end

  def update
    if @event_track.update event_track_params
      respond_to do |format|
        format.js { respond_with_scoreboard }
      end
    else
      respond_with_errors @event_track.errors
    end
  end

  def destroy
    if @event_track.destroy
      respond_to do |format|
        format.js { respond_with_scoreboard }
        format.json { head :no_content }
      end 
    else
      respond_with_errors @event_track.errors
    end
  end

  def new
    @event_track = EventTrack.new event_track_params
  end

  def edit
  end

  def show
    respond_to do |format|
      format.html do
        redirect_to track_path(@event_track.track, 
                               f: @event.range_from, 
                               t: @event.range_to)
      end
      format.js do
        @track_data = Tracks::CompetitionTrack.new(@event_track,
                                                   preferred_speed_units,
                                                   preferred_distance_units,
                                                   preferred_altitude_units)
        @track_data.load
      end
    end
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
      :track_from,
      :is_disqualified,
      :disqualification_reason,
      track_attributes: [
        :file,
        :profile_id,
        :place_id,
        :wingsuit_id
      ]
    )
  end

  def authorize_update_event
    authorize! :update, @event
  end

  def authorize_show_event
    authorize! :read, @event
  end
end
