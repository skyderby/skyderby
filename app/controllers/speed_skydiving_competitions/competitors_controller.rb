class SpeedSkydivingCompetitions::CompetitorsController < ApplicationController
  include SpeedSkydivingCompetitionScoped, CompetitorProfileParams

  before_action :set_event
  before_action :authorize_event_update!
  before_action :set_competitor, except: %i[new create]

  def new
    @competitor = @event.competitors.new
  end

  def create
    @competitor = @event.competitors.new(competitor_params)

    if @competitor.save
      broadcast_scoreboard
    else
      respond_with_errors @competitor
    end
  end

  def edit; end

  def update
    if @competitor.update(competitor_params)
      broadcast_scoreboard
    else
      respond_with_errors @competitor
    end
  end

  def destroy
    if @competitor.destroy
      broadcast_scoreboard
      head :no_content
    else
      respond_with_errors @competitor
    end
  end

  private

  def competitor_params
    permitted = params.require(:competitor).permit(
      :assigned_number, :category_id, :profile_id, :alias_id, :photo,
      profile_attributes: %i[name country_id]
    )

    resolve_profile(permitted)
  end

  def set_competitor
    @competitor = @event.competitors.find(params[:id])
  end
end
