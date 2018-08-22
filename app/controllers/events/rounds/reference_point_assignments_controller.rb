module Events
  module Rounds
    class ReferencePointAssignmentsController < ApplicationController
      include EventScoped

      before_action :set_event, :authorize_event, :set_round

      def create
        assignment = @round.reference_point_assignments.find_or_create_by(competitor_id: competitor_id)

        if assignment.update(assignment_params)
          head :ok
        else
          respond_with_errors(assignment.errors)
        end
      end

      def destroy
        assignment = @round.reference_point_assignments.find_by(competitor_id: competitor_id)
        assignment&.destroy!

        head :ok
      end

      private

      def set_round
        @round = @event.rounds.find(params[:round_id])
      end

      def assignment_params
        params.require(:reference_point_assignment).permit(:reference_point_id)
      end

      def competitor_id
        params[:competitor_id]
      end
    end
  end
end
