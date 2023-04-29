module Events
  class CompetitorsController < ApplicationController
    include EventScoped

    before_action :set_event, :authorize_event
    before_action :set_competitor, only: [:edit, :update, :destroy]

    def new
      @competitor = @event.competitors.new
    end

    def create
      @registration = CompetitorRegistration.new(competitor_params)

      if @registration.create
        respond_to do |format|
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors(@registration.errors)
      end
    end

    def update
      @registration = CompetitorRegistration.new(competitor_params)

      if @registration.update
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
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors(@competitor.errors)
      end
    end

    def edit; end

    private

    def set_competitor
      @competitor = @event.competitors.find(params[:id])
    end

    def competitor_params
      params.permit(
        :id,
        :name,
        :country_id,
        :new_profile,
        :profile_id,
        :suit_id,
        :section_id,
        :event_id,
        :assigned_number
      )
    end
  end
end
