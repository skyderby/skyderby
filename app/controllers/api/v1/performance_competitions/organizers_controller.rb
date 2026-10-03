class Api::V1::PerformanceCompetitions::OrganizersController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement
  include Api::EventOrganizers
end
