class Api::V1::SpeedSkydivingCompetitions::ResultsController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @results = @event.results
  end

  def create
    authorize @event, :update?

    @result = @event.results.new(create_params)

    respond_to do |format|
      if @result.save
        format.json
      else
        format.json { respond_with_errors @result.errors }
      end
    end
  end

  def update
    authorize @event, :update?

    @result = @event.results.find(params[:id])

    @result.transaction do
      @result.track.update!(update_params[:track_attributes])
      @result.calculate_result
      @result.save!
    end

    respond_to do |format|
      format.json
    end
  end

  def destroy
    authorize @event, :update?

    @result = @event.results.find(params[:id])

    respond_to do |format|
      if @result.destroy
        format.json
      else
        format.json { respond_with_errors @result.errors }
      end
    end
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

  def create_params
    params.require(:result).permit \
      :round_id,
      :competitor_id,
      :track_from,
      :track_id,
      :track_file
  end

  def update_params
    params.require(:result).permit(track_attributes: [:ff_start, :ff_end])
  end
end
