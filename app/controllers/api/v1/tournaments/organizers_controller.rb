module Api
  module V1
    module Tournaments
      class OrganizersController < Api::ApplicationController
        include Api::TournamentManagement
        include Api::EventOrganizers
      end
    end
  end
end
