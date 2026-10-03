module Api
  module V1
    module SpeedSkydivingCompetitions
      class TeamsController < Api::ApplicationController
        include Api::SpeedSkydivingCompetitionScoped
        include Api::EventManagement
        include SpeedSkydivingCompetitionBroadcasts

        before_action :set_team, only: %i[update destroy]

        def create
          @team = @event.teams.new(team_params)

          if @team.save
            broadcast_teams_scoreboard
            render :show, status: :created
          else
            render_record_errors @team
          end
        end

        def update
          if @team.update(team_params)
            broadcast_teams_scoreboard
            render :show
          else
            render_record_errors @team
          end
        end

        def destroy
          if @team.destroy
            broadcast_teams_scoreboard
            head :no_content
          else
            render_record_errors @team
          end
        end

        private

        def set_team
          @team = @event.teams.find(params[:id])
        end

        def team_params = params.require(:team).permit(:name)
      end
    end
  end
end
