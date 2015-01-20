module Api
  class CompetitorsController < ApplicationController
    def create
      @competitor = Competitor.new(comp_params)
      if @competitor.save
        @competitor
      else
        render json: @competitor.errors,
               status: :unprocessable_entity
      end
    end

    def update
      @competitor = Competitor.find(params[:id])

      if @competitor.update(comp_params)
        @competitor
      else
        render json: @competitor.errors, status: :unprocessable_entity
      end
    end
# { id: @competitor.id,
#                        profile_id: @competitor.user_profile.id,
#                        name: @competitor.user_profile.name,
#                        section_id: @competitor.section_id,
#                        wingsuit: @competitor.wingsuit.name,
#                        wingsuit_id: @competitor.wingsuit.id }
    
    private

    def comp_params
      params.require(:competitor).permit(:name, :profile_id, :profile_name,
                                         :wingsuit_id, :section_id, :event_id)
    end
  end
end
