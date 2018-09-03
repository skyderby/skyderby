module Events
  module Results
    class PenaltiesController < ApplicationController
      include EventTrackScoped, EventScoped

      def show
        respond_to do |format|
          format.html
          format.js
        end
      end

      def update
        if @result.update(penalty_params)
          respond_with_scoreboard
        else
          respond_with_errors(@result.errors)
        end
      end

      private

      def penalty_params
        params.require(:penalty).permit(:penalized, :penalty_size, :penalty_reason)
      end
    end
  end
end
