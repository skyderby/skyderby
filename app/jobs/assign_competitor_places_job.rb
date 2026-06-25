class AssignCompetitorPlacesJob < ApplicationJob
  queue_as :default

  def perform(competition)
    competition.assign_competitor_places!
  end
end
