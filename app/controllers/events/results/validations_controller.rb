class Events::Results::ValidationsController < ApplicationController
  include EventScoped

  before_action :set_event
  before_action :authorize_event_update!

  def update
    @result = @event.results.find(params[:result_id])

    if @result.update(validation_params)
      broadcast_scoreboards
      broadcast_validation_update_for(@result)
    end
  end

  private

  def validation_params = params.require(:result).permit(:validated)
end
