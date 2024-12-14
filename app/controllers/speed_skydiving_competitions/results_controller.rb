class SpeedSkydivingCompetitions::ResultsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :authorize_event_update!, except: %i[show]
  before_action :authorize_event_access!, only: %i[show]
  before_action :set_result, except: %i[new]

  def new; end

  def show; end

  private

  def set_result
    @result = @event.results.find(params[:id])
  end
end
