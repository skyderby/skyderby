module Tournaments
  module Qualifications
    module Results
      class JumpRangesController < ApplicationController
        include TournamentScoped
        include ResultScoped, RespondWithScoreboard

        def show
          respond_to do |format|
            format.html
            format.turbo_stream
          end
        end

        def update
          @result.transaction do
            @result.track.update!(track_params)
            @result.update!(result_params)
          end

          respond_with_scoreboard
        rescue ActiveRecord::RecordInvalid
          respond_with_errors(@result.errors)
        end

        private

        def track_params
          params.require(:jump_range).permit(:jump_range)
        end

        def result_params
          params.require(:jump_range).permit(:start_time)
        end
      end
    end
  end
end
