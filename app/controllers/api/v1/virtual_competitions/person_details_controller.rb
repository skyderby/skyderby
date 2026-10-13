module Api
  module V1
    module VirtualCompetitions
      class PersonDetailsController < Api::ApplicationController
        def show
          competition = VirtualCompetition.find(params[:virtual_competition_id])
          raise ActiveRecord::RecordNotFound unless competition.viewable?(current_user)

          @details = VirtualCompetition::PersonDetails.new(
            virtual_competition_id: params[:virtual_competition_id],
            profile_id: params[:profile_id],
            year: params[:year],
            period: params[:period]
          )
        end
      end
    end
  end
end
