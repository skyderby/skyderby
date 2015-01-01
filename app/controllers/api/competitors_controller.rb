module Api
  class CompetitorsController < ApplicationController

    def update
      @competitor = Competitor.find(params[:id])

      respond_to do |format|
        if @competitor.update(comp_params)
          format.json { render json: {
                                         :id => @competitor.id,
                                         :user_id => @competitor.user.id,
                                         :profile_id => @competitor.user.user_profile.id,
                                         :name => @competitor.user.user_profile.name,
                                         :first_name => @competitor.user.user_profile.first_name,
                                         :last_name => @competitor.user.user_profile.last_name,
                                         :section_id => @competitor.section_id,
                                         :wingsuit => @competitor.wingsuit.name,
                                         :wingsuit_id => @competitor.wingsuit.id
                                     },
                               status: :ok
          }
        else
          format.json { render json: @competitor.errors, status: :unprocessable_entity }
        end
      end
    end

    private

    def comp_params
      params.require(:competitor).permit(:name, :user_id, :wingsuit_id, :section_id, :event_id)
    end

  end
end
