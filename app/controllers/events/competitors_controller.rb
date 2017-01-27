# encoding: utf-8
module Events
  class CompetitorsController < ApplicationController
    include EventLoading

    before_action :set_competitor, only: [:update, :destroy]

    load_resource :event
    before_action :authorize_event

    load_and_authorize_resource :competitor, through: :event

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

    def new; end

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

    def authorize_event
      authorize! :update, @event
    end
  end
end
