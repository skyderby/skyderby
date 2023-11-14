module Api
  module V1
    module OnlineRankings
      module Groups
        class StandingsByYearController < ApplicationController
          def show
            @group = VirtualCompetition::Group.find(params[:group_id])
            @standings = @group.standings_by_year(params[:year].to_i)
          end
        end
      end
    end
  end
end
