module Api
  module V1
    module VirtualCompetitions
      class GroupsController < Api::ApplicationController
        include VirtualCompetitionGroupScoped

        def show
          @scoreboard = build_scoreboard(VirtualCompetition::Group.find(params[:id]))
        end
      end
    end
  end
end
