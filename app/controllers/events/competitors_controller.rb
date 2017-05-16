# encoding: utf-8
module Events
  class CompetitorsController < ApplicationController
    include EventLoading

    before_action :set_event
    before_action :authorize_event
    before_action :set_competitor, only: [:edit, :update, :destroy]

    def create
      @competitor = @event.competitors.new(competitor_params)

      if @competitor.save
        respond_to do |format|
          format.json
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors(@competitor.errors)
      end
    end

    def update
      if @competitor.update(competitor_params)
        respond_to do |format|
          format.json
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors(@competitor.errors)
      end
    end

    def destroy
      if @competitor.destroy
        respond_to do |format|
          format.json { head :no_content }
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors(@competitor.errors)
      end
    end

    def new
      @competitor = @event.competitors.new
    end

    def edit; end

    private

    def set_competitor
      @competitor = Competitor.find(params[:id])
    end

    def competitor_params
      params.require(:competitor).permit(
        :name,
        :profile_id,
        :profile_mode,
        :wingsuit_id,
        :section_id,
        :event_id,
        profile_attributes: [:name, :country_id]
      )
    end
  end
end
