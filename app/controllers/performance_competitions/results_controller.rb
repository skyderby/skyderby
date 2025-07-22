class PerformanceCompetitions::ResultsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :set_event_result, only: [:show, :edit, :update, :destroy]
  before_action :authorize_event_update!, except: :show
  before_action :authorize_event_access!, only: :show

  def create
    @result = @event.results.new result_params

    if @result.save
      respond_with_scoreboard
      broadcast_scoreboards
    else
      respond_with_errors @result
    end
  end

  def update
    if @result.update result_params
      respond_with_scoreboard
      broadcast_scoreboards
    else
      respond_with_errors @result
    end
  end

  def destroy
    if @result.destroy
      respond_with_scoreboard
      broadcast_scoreboards
    else
      respond_with_errors @result
    end
  end

  def new
    @result = @event.results.new result_params
  end

  def edit; end

  def show
    response.headers['X-FRAME-OPTIONS'] = 'ALLOWALL'
  end

  private

  def set_event_result
    @result = @event.results.find(params[:id])
  end

  def result_params
    params.require(:result).permit(:competitor_id, :round_id, :track_id, :track_from, track_attributes: [:file])
  end

  def show_params
    params.permit(:charts_mode, :charts_units)
  end

  helper_method :show_params
end
