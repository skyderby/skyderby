class SpeedSkydivingCompetitions::StatusesController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def update
    if @event.update(status_params)
      broadcast_scoreboard
      broadcast_actions_bar

      head :ok
    else
      respond_with_errors(@event)
    end
  end

  private

  def status_params = params.require(:event).permit(:status)

  def broadcast_actions_bar
    Turbo::StreamsChannel.broadcast_replace_to @event, :actions_bar,
                                               target: 'actions-bar',
                                               partial: 'speed_skydiving_competitions/actions_bar',
                                               locals: { event: @event }
  end
end
