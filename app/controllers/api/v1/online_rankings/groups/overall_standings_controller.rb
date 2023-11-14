module Api
  module V1
    module OnlineRankings
      module Groups
        class OverallStandingsController < ApplicationController
          def show
            @group = VirtualCompetition::Group.find(params[:group_id])
            @standings = @group.overall_standing_rows.where(rank: 1..20, wind_cancelled: false).group_by(&:suits_kind)
          end
        end
      end
    end
  end
end
