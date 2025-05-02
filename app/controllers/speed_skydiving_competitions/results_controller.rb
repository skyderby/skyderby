class SpeedSkydivingCompetitions::ResultsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!, except: %i[show]
  before_action :authorize_event_access!, only: %i[show]
  before_action :set_result, except: %i[new create]

  def new
    @result = @event.results.new(new_result_params)
  end

  def show; end

  def create
    @result = @event.results.new(create_params)

    if @result.save
      broadcast_scoreboard
      head :no_content
    else
      respond_with_errors(@result)
    end
  end

  def destroy
    if @result.destroy
      broadcast_scoreboard
      head :no_content
    else
      respond_with_errors(@result)
    end
  end

  private

  def new_result_params
    params.permit(:round_id, :competitor_id)
  end

  def create_params
    existing_track = params.delete(:track_from) == 'existing_track'
    if existing_track
      params[:result].delete(:track_attributes)
    else
      params[:result].delete(:track_id)
    end

    params.require(:result).permit(:competitor_id, :round_id, :track_id, track_attributes: [:file])
  end

  def set_result
    @result = @event.results.find(params[:id])
  end
end
