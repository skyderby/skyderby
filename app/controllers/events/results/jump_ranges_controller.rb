module Events
  module Results
    class JumpRangesController < ApplicationController
      include EventTrackScoped, EventScoped

      def show
        respond_to do |format|
          format.html
          format.js
        end
      end

      def update
        @result.transaction do
          @result.track.update!(jump_range_params)
          @result.calculate_result
          @result.save!
        end

        respond_with_scoreboard
      rescue ActiveRecord::RecordInvalid
        respond_with_errors(@result.errors)
      end

      private

      def jump_range_params
        params.require(:jump_range).permit(:jump_range)
      end
    end
  end
end
