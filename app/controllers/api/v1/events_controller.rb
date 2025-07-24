class Api::V1::EventsController < ApplicationController
  before_action :set_event

  def show
    respond_not_authorized unless @event.viewable?
  end

  private

  def set_event
    @event = PerformanceCompetition.find(params[:id])
  end
end
