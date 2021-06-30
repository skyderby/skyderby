class Api::V1::SpeedSkydivingCompetitions::Categories::PositionsController < Api::ApplicationController
  def update
    category = event.categories.find(params[:category_id])

    respond_to do |format|
      case direction
      when 'up'
        category.move_upper
        format.json { head :ok }
      when 'down'
        category.move_lower
        format.json { head :ok }
      else
        format.json { render json: { errors: ['unknown direction'] }, status: :unprocessable_entity }
      end
    end
  end

  private

  def event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])

  def direction = params[:direction].to_s.downcase
end
