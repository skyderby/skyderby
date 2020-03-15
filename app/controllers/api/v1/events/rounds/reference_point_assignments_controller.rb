module Api
  module V1
    module Events
      module Rounds
        class ReferencePointAssignmentsController < ApplicationController
          include EventScoped

          before_action :set_event, :authorize_event, :set_round

          def create
            assignment = @round.reference_point_assignments.find_or_initialize_by(competitor_id: competitor_id)

            perform_action =
              if reference_point_id
                proc { assignment.update(reference_point_id: reference_point_id) }
              else
                proc { assignment.destroy }
              end

            if perform_action.call
              head :ok
            else
              respond_with_errors(assignment.errors)
            end
          end

          private

          def set_round
            @round = @event.rounds.find(params[:round_id])
          end

          def assignment_params
            params.permit(:competitor_id, :reference_point_id)
          end

          def reference_point_id
            assignment_params[:reference_point_id].presence
          end

          def competitor_id
            assignment_params[:competitor_id]
          end
        end
      end
    end
  end
end
