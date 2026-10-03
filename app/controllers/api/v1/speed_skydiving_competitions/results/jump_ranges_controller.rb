module Api
  module V1
    module SpeedSkydivingCompetitions
      module Results
        class JumpRangesController < Api::ApplicationController
          include Api::SpeedSkydivingCompetitionScoped
          include Api::EventManagement
          include SpeedSkydivingCompetitionBroadcasts

          def update
            @result = @event.results.find(params[:result_id])

            @result.transaction do
              @result.track.update!(track_attributes)
              @result.calculate_result
              @result.save!
            end

            broadcast_scoreboard
            render 'api/v1/speed_skydiving_competitions/results/show'
          rescue ActiveRecord::RecordInvalid => e
            render_record_errors e.record
          end

          private

          def track_attributes
            jump_range = params.require(:jump_range)
            ff_start, ff_end = jump_range.require(%i[ff_start ff_end])
            attributes = { jump_range: "#{ff_start};#{ff_end}" }
            attributes[:landing_fl_time] = jump_range[:landing_fl_time] if jump_range.key?(:landing_fl_time)
            attributes
          end
        end
      end
    end
  end
end
