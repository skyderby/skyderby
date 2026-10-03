module Api
  module V1
    module Tournaments
      module Matches
        class PositionsController < Api::ApplicationController
          include Api::TournamentManagement

          DIRECTIONS = %w[up down].freeze

          def update
            direction = params.require(:direction)
            return render_invalid_direction if DIRECTIONS.exclude?(direction)

            @match = @tournament.matches.find(params[:match_id])
            @match.move(direction)

            render 'api/v1/tournaments/matches/show'
          end

          private

          def render_invalid_direction
            render_errors ['Invalid direction'], status: :unprocessable_content
          end
        end
      end
    end
  end
end
