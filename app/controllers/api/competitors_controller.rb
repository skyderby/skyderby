module Api
  class CompetitorsController < ApplicationController
    before_action :set_competitor, only: [:update, :destroy]

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
      if @competitor.update(comp_params)
        @competitor
      else
        render json: @competitor.errors,
               status: :unprocessable_entity
      end
    end

    def destroy
      @competitor.destroy
      head :no_content
    end

    private

    def set_competitor
      @competitor = Competitor.find(params[:id])
    end

    def comp_params
      params.require(:competitor)
        .permit(:name, :profile_id, :profile_name,
                :wingsuit_id, :section_id, :event_id)
    end
  end
end
