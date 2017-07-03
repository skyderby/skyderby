module VirtualCompetitions
  class PersonDetailsController < ApplicationController
    def show
      @details = PersonDetails.new(
        virtual_competition_id: details_params[:virtual_competition_id],
        profile_id: details_params[:profile_id]
      )
      respond_to do |format|
        format.js
      end
    end

    private

    def details_params
      params.permit(:virtual_competition_id, :profile_id)
    end
  end
end
