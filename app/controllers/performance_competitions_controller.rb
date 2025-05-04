class PerformanceCompetitionsController < ApplicationController
  def new
    authorize Event
    @event = Event.new
  end
end
