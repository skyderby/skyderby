module Api
  module V1
    module Boogies
      class OrganizersController < Api::ApplicationController
        include Api::BoogieScoped
        include Api::EventManagement
        include Api::EventOrganizers
      end
    end
  end
end
