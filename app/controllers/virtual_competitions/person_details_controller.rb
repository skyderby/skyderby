module VirtualCompetitions
  class PersonDetailsController < ApplicationController
    def show
      authorize VirtualCompetition.find(details_params[:virtual_competition_id]), :show?

      @details = VirtualCompetition::PersonDetails.new(
        virtual_competition_id: details_params[:virtual_competition_id],
        profile_id: details_params[:profile_id],
        year: details_params[:year],
        period: details_params[:period]
      )

      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to virtual_competition_path(details_params[:virtual_competition_id]) }
      end
    end

    private

    def details_params
      params.permit(:virtual_competition_id, :profile_id, :year, :period)
    end
  end
end
