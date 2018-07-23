module Tournaments
  module Matches
    module Slots
      class JumpRangesController < ApplicationController
        include TournamentScoped

        before_action :set_match, :set_slot

        def show
          authorize @tournament, :update?

          respond_to do |format|
            format.js
          end
        end

        def update
          @slot.transaction do
            @slot.track.update!(jump_range_params)
            @slot.calculate_result
            @slot.save!
          end

          respond_with_scoreboard
        rescue ActiveRecord::RecordInvalid
          respond_with_errors(@slot.errors)
        end


        private

        def jump_range_params
          params.require(:jump_range).permit(:jump_range)
        end

        def set_match
          @match = @tournament.matches.find(params[:match_id])
        end

        def set_slot
          @slot = @match.slots.find(params[:slot_id])
        end
      end
    end
  end
end
