class Api::V1::SpeedSkydivingCompetitionsController < Api::ApplicationController
  def create
    authorize SpeedSkydivingCompetition
    @event = SpeedSkydivingCompetition.new(event_params) do |event|
      event.responsible = Current.user
    end

    respond_to do |format|
      if @event.save
        format.json
      else
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end

  def show
    @event = authorize SpeedSkydivingCompetition.find(params[:id])
  end

  private

  def event_params
    params.require(:speed_skydiving_competition).permit \
      :name,
      :starts_at,
      :place_id,
      :status,
      :visibility,
      :use_teams
  end
end
