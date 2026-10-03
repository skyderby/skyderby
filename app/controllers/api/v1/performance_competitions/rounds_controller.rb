class Api::V1::PerformanceCompetitions::RoundsController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement
  include PerformanceCompetitionBroadcasts

  before_action :set_round, only: %i[update destroy]

  def create
    @round = @event.rounds.new(params.require(:round).permit(:discipline))

    if @round.save
      broadcast_scoreboards
      render :show, status: :created
    else
      render_record_errors @round
    end
  rescue ArgumentError => e
    render_errors [e.message], status: :unprocessable_content
  end

  def update
    if @round.update(params.require(:round).permit(:completed))
      broadcast_scoreboards
      broadcast_teams_scoreboard
      render :show
    else
      render_record_errors @round
    end
  end

  def destroy
    if @round.destroy
      broadcast_scoreboards
      head :no_content
    else
      render_record_errors @round
    end
  end

  private

  def set_round
    @round = @event.rounds.find(params[:id])
  end
end
