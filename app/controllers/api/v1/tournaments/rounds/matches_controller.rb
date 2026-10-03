module Api
  module V1
    module Tournaments
      module Rounds
        class MatchesController < Api::ApplicationController
          include Api::TournamentManagement

          def create
            @match = @tournament.rounds.find(params[:round_id]).matches.new

            if @match.save
              render 'api/v1/tournaments/matches/show', status: :created
            else
              render_record_errors @match
            end
          end
        end
      end
    end
  end
end
