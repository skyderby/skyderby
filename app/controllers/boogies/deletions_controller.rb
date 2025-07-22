class Boogies::DeletionsController < ApplicationController
  include BoogieContext

  before_action :set_event, :authorize_event_deletion!

  def new; end

  def create
    if @event.name == deletion_params[:event_name]
      @event.permanently_delete(including_tracks: delete_tracks_param)

      redirect_to events_path(format: :html), status: :see_other
    else
      render(
        turbo_stream: turbo_stream.append(
          :toasts,
          partial: 'toasts/toast',
          locals: { message: t('events.event_name_mismatch'), type: 'error' }
        ),
        status: :unprocessable_entity
      )
    end
  rescue ActiveRecord::RecordNotDestroyed
    render(
      turbo_stream: turbo_stream.append(
        :toasts,
        partial: 'toasts/toast',
        locals: { message: t('events.event_deletion_failed'), type: 'error' }
      ),
      status: :unprocessable_entity
    )
  end

  private

  def authorize_event_deletion!
    respond_not_authorized unless @event.deletable?
  end

  def deletion_params
    params.require(:event_deletion).permit(:event_name, :delete_tracks)
  end

  def delete_tracks_param
    deletion_params[:delete_tracks] == '1'
  end
end
