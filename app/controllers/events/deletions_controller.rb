module Events
  class DeletionsController < ApplicationController
    before_action :set_event

    def new
      respond_to do |format|
        format.html
      end
    end

    def create
      if @event.name == deletion_params[:event_name]
        EventDeletion.execute(@event, delete_tracks: delete_tracks_param)
        redirect_to events_path
      else
        respond_to do |format|
          format.js { head :no_content, status: :unprocessable_entity }
        end
      end
    end

    private

    def set_event
      @event = Event.find(params[:event_id])
    end

    def deletion_params
      params.require(:event_deletion).permit(:event_name, :delete_tracks)
    end

    def delete_tracks_param
      deletion_params[:delete_tracks] == '1'
    end
  end
end
