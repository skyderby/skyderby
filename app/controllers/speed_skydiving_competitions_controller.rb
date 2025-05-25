class SpeedSkydivingCompetitionsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event, only: %i[show edit update]

  before_action :authorize_event_create!, only: %i[new create]
  before_action :authorize_event_update!, except: %i[show new create]
  before_action :authorize_event_access!, only: %i[show]

  def new
    @event = SpeedSkydivingCompetition.new(starts_at: Time.zone.today)
  end

  def create
    @event = SpeedSkydivingCompetition.new(event_params)
    @event.responsible = Current.user

    if @event.save
      redirect_to speed_skydiving_competition_path(@event)
    else
      respond_with_errors(@event)
    end
  end

  def show
    @standings = @event.standings(until_round: params[:until_round]&.to_i)
  end

  def edit; end

  def update
    if @event.update event_params
      redirect_to speed_skydiving_competition_path(@event)
    else
      respond_with_errors(@event)
    end
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.includes(:categories, :competitors, :results).find(params[:id])
  end

  def event_params
    params
      .require(:event)
      .permit(:name, :starts_at, :place_id, :status, :visibility, :use_teams)
  end
end
