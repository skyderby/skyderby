module Api
  module V1
    module SpeedSkydivingCompetitions
      class OrganizersController < Api::ApplicationController
        include Api::SpeedSkydivingCompetitionScoped
        include Api::EventManagement
        include Api::EventOrganizers
      end
    end
  end
end
