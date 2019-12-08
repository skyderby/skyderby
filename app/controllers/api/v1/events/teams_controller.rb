module Api
  module V1
    module Events
      class TeamsController < ApplicationController
        before_action :set_event

        def index
          authorize @event, :show?

          @teams = @event.teams

          respond_to do |format|
            format.json
          end
        end

        def create
          authorize @event, :edit?

          @team = @event.teams.new(team_params)

          respond_to do |format|
            if @team.save
              format.json
            else
              format.json { render json: { errors: team.errors } }
            end
          end
        end

        def update
          authorize @event, :edit?

          @team = @event.teams.find(params[:id])

          respond_to do |format|
            if @team.update(team_params)
              format.json
            else
              format.json { render json: { errors: @team.errors } }
            end
          end
        end

        def destroy
          authorize @event, :edit?

          @team = @event.teams.find(params[:id])

          respond_to do |format|
            if @team.destroy
              format.json
            else
              format.json { render json: { errors: @team.errors } }
            end
          end
        end

        private

        def set_event
          @event = Event.find(params[:event_id])
        end

        def team_params
          params.require(:team).permit(:name, competitor_ids: [])
        end
      end
    end
  end
end
