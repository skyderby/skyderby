class SpeedSkydivingCompetitions::ResultsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :authorize_update_to_event!, except: %i[show]
  before_action :set_result, except: %i[new]

  def new; end

  def show
    authorize @event, :show?
  end

  private

  def set_result
    @result = @event.results.find(params[:id])
  end
end
