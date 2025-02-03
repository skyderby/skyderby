class PerformanceCompetitions::DeletionsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :authorize_event_update!

  def new; end

  def create
    return if @event.name != deletion_params[:event_name]

    EventDeletion.execute(@event, delete_tracks: delete_tracks_param)
    redirect_to events_path(format: :html)
  end

  private

  def deletion_params
    params.require(:event_deletion).permit(:event_name, :delete_tracks)
  end

  def delete_tracks_param = ActiveModel::Type::Boolean.new.cast(deletion_params[:delete_tracks])
end
