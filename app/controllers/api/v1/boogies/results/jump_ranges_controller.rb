module Api
  module V1
    module Boogies
      module Results
        class JumpRangesController < Api::ApplicationController
          include Api::BoogieScoped
          include Api::EventManagement
          include BoogieScoreboardBroadcasts

          def update
            @result = @event.results.find(params[:result_id])

            @result.transaction do
              @result.track.update!(track_attributes)
              @result.calc_result
              @result.updated_at = Time.current
              @result.save!
            end

            broadcast_scoreboards
            render 'api/v1/boogies/results/show'
          rescue ActiveRecord::RecordInvalid => e
            render_record_errors e.record
          end

          private

          def jump_range_params
            params.require(:jump_range).permit(:ff_start, :ff_end, :landing_fl_time)
          end

          def track_attributes
            attributes = { jump_range: jump_range_params.require(%i[ff_start ff_end]).join(';') }
            return attributes unless jump_range_params.key?(:landing_fl_time)

            attributes.merge(landing_fl_time: jump_range_params[:landing_fl_time])
          end
        end
      end
    end
  end
end
