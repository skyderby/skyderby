class PerformanceCompetitions::ResultsController < ApplicationController
  include PerformanceCompetitionScoped
  include UnitsHelper, ChartParams

  before_action :set_result, only: [:show, :edit, :update, :destroy]
  before_action :authorize_event_update!, except: :show
  before_action :authorize_event_access!, only: :show

  def create
    @result = @event.results.new result_params

    if @result.save
      broadcast_scoreboard
    else
      respond_with_errors @result
    end
  end

  def update
    if @result.update result_params
      broadcast_scoreboard
    else
      respond_with_errors @result
    end
  end

  def destroy
    if @result.destroy
      broadcast_scoreboard
      head :no_content
    else
      respond_with_errors @result
    end
  end

  def new
    @result = @event.results.new(new_result_params)
  end

  def edit; end

  def show
    response.headers['X-FRAME-OPTIONS'] = 'ALLOWALL'

    @track_presenter = Tracks::CompetitionTrackView.new \
      @result,
      ChartsPreferences.new(session)

    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  private

  def set_result
    @result = @event.results.find(params[:id])
  end

  def respond_with_scoreboard
    create_scoreboard(params[:event_id])
    render template: 'events/results/scoreboard_with_highlight'
  end

  def new_result_params = params.permit(:competitor_id, :round_id)

  def result_params
    existing_track = params.delete(:track_from) == 'existing_track'
    if existing_track
      params[:result].delete(:track_attributes)
    else
      params[:result].delete(:track_id)
    end

    params.require(:result).permit(:competitor_id, :round_id, :track_id, track_attributes: [:file])
  end

  def show_params
    params.permit(:charts_mode, :charts_units)
  end
  helper_method :show_params
end
