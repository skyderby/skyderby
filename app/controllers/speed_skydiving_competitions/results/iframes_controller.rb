class SpeedSkydivingCompetitions::Results::IframesController < SpeedSkydivingCompetitions::ResultsController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :set_result
  before_action :authorize_event_access!

  def show
    response.headers['X-FRAME-OPTIONS'] = 'ALLOWALL'
  end

  private

  def set_result
    @result = @event.results.find_by(id: params[:result_id])
  end
end
