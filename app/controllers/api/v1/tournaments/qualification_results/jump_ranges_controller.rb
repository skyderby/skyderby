module Api
  module V1
    module Tournaments
      module QualificationResults
        class JumpRangesController < Api::ApplicationController
          include Api::TournamentManagement
          include Api::TournamentJumpRange

          def update
            @result = @tournament.qualification_jumps.find(params[:qualification_result_id])
            return render_missing_track unless @result.track

            @result.transaction do
              assign_jump_range(@result.track)
              @result.track.save!
              @result.update!(jump_range_params.permit(:start_time, :result, :canopy_time))
            end

            broadcast_qualification_scoreboard
            render 'api/v1/tournaments/qualification_results/show'
          rescue ActiveRecord::RecordInvalid => e
            render_record_errors e.record
          end

          private

          def render_missing_track
            @result.errors.add(:track, :blank)
            render_record_errors @result
          end
        end
      end
    end
  end
end
