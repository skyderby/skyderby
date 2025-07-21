module Events
  class CompetitorsController < ApplicationController
    include EventScoped

    before_action :set_event, :authorize_event
    before_action :set_competitor, except: %i[new create]

    def new
      @competitor = @event.competitors.new
    end

    def create
      @competitor = @event.competitors.new(competitor_params)

      if @competitor.save
        respond_with_scoreboard
        broadcast_scoreboards
      else
        respond_with_errors @competitor
      end
    end

    def edit; end

    def update
      if @competitor.update(competitor_params)
        respond_with_scoreboard
        broadcast_scoreboards
      else
        respond_with_errors @competitor
      end
    end

    def destroy
      if @competitor.destroy
        respond_with_scoreboard
        broadcast_scoreboards
      else
        respond_with_errors @competitor
      end
    end

    private

    def competitor_params
      new_profile = ActiveModel::Type::Boolean.new.cast(params.delete(:new_profile))

      if new_profile
        params[:competitor].delete(:profile_id)
      else
        params[:competitor].delete(:profile_attributes)
      end

      params.require(:competitor)
            .permit(:assigned_number, :section_id, :suit_id, :profile_id, profile_attributes: %i[name country_id])
    end

    def set_competitor
      @competitor = @event.competitors.find(params[:id])
    end
  end
end
