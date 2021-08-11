class Api::V1::SpeedSkydivingCompetitionsController < Api::ApplicationController
  before_action :set_event, only: %i[show update]

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
    authorize @event
  end

  def update
    authorize @event

    respond_to do |format|
      if @event.update(event_params)
        format.json
      else
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
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

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:id])
  end
end
