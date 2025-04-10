class SpeedSkydivingCompetitionsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event, only: [:show, :update]

  before_action :authorize_event_update!, except: %i[show]
  before_action :authorize_event_access!, only: %i[show]

  def show; end

  def update
    if @event.update event_params
      broadcast_scoreboard
      redirect_to speed_skydiving_competition_path(@event)
    else
      respond_with_errors(@event)
    end
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.includes(:categories, :competitors, :results).find(params[:id])
  end

  def authorize_event_update!
    respond_not_authorized unless @event.editable?
  end

  def authorize_event_access!
    respond_not_authorized unless @event.viewable?
  end

  def event_params
    params
      .require(:event)
      .permit(:name, :starts_at, :place_id, :status, :visibility, :use_teams)
  end
end
