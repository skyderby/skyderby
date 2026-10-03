class Api::V1::PerformanceCompetitions::DeletionsController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement

  skip_before_action :authorize_event_update!
  before_action :authorize_event_deletion!

  def create
    return render_errors([t('events.event_name_mismatch')], status: :unprocessable_content) unless name_matches?

    @event.permanently_delete(including_tracks: delete_tracks?)
    head :no_content
  rescue ActiveRecord::RecordNotDestroyed
    render_errors [t('events.event_deletion_failed')], status: :unprocessable_content
  end

  private

  def authorize_event_deletion!
    respond_not_authorized unless @event.deletable?
  end

  def deletion_params = params.require(:event_deletion).permit(:event_name, :delete_tracks)

  def name_matches? = @event.name == deletion_params[:event_name]

  def delete_tracks? = ActiveModel::Type::Boolean.new.cast(deletion_params[:delete_tracks]) || false
end
