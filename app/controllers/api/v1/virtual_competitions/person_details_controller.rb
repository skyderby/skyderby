module Api
  module V1
    module VirtualCompetitions
      class PersonDetailsController < Api::ApplicationController
        def show
          @details = VirtualCompetition::PersonDetails.new(
            virtual_competition_id: params[:virtual_competition_id],
            profile_id: params[:profile_id]
          )
        end
      end
    end
  end
end
