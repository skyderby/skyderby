class Api::V1::PerformanceCompetitions::Categories::PositionsController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement
  include PerformanceCompetitionBroadcasts

  DIRECTIONS = { 'up' => :move_upper, 'down' => :move_lower }.freeze

  def update
    @category = @event.categories.find(params[:category_id])
    move = DIRECTIONS[params.require(:direction)]
    return render_errors(['Invalid direction'], status: :unprocessable_content) unless move

    @category.public_send(move)

    if @category.errors.empty?
      broadcast_scoreboards
      render 'api/v1/performance_competitions/categories/show'
    else
      render_record_errors @category
    end
  end
end
