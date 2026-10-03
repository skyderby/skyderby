module Api
  module V1
    module Tournaments
      module Matches
        module Slots
          class JumpRangesController < Api::ApplicationController
            include Api::TournamentManagement
            include Api::TournamentJumpRange

            def update
              @match = @tournament.matches.find(params[:match_id])
              @slot = @match.slots.find(params[:slot_id])
              return render_missing_track unless @slot.track

              @slot.transaction do
                assign_jump_range(@slot.track)
                @slot.track.save!
                jump_range_params.key?(:start_time) ? update_start_time : recalculate(@slot)
              end

              @slot.reload
              render 'api/v1/tournaments/slots/show'
            rescue ActiveRecord::RecordInvalid => e
              render_record_errors e.record
            end

            private

            def update_start_time
              start_time = jump_range_params[:start_time]
              start_time.blank? ? @match.start_time_in_seconds = nil : @match.start_time = start_time
              @match.save!
              @match.slots.select(&:track).each { |slot| recalculate(slot) }
            end

            def recalculate(slot)
              slot.calculate_result
              slot.save!
            end

            def render_missing_track
              @slot.errors.add(:track, :blank)
              render_record_errors @slot
            end
          end
        end
      end
    end
  end
end
