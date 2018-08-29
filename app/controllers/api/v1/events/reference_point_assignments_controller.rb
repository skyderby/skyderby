module Api
  module V1
    module Events
      class ReferencePointAssignmentsController < Api::ApplicationController
        def create
          event = Event.find(params[:event_id])

          authorize event, :update?

          reference_point = event.reference_points.find_or_create(reference_point_params)

          round = event.rounds.find_by(id: params[:round_id]) || event.rounds.find_by_name(params[:round_name])
          competitor = event.competitors.find_by(id: params[:competitor_id])
          assignment = round.reference_point_assignments.find_or_create_by(competitor: competitor)

          respond_to do |format|
            if assignment.update(reference_point: reference_point)
              format.json { head :ok }
            else
              format.json do
                render template: 'errors/api_errors',
                       locals: { errors: assignment.errors },
                       status: :bad_request
              end
            end
          end
        end

        private

        def reference_point_params
          params.require(:reference_point).permit(:name, :latitude, :longitude)
        end
      end
    end
  end
end
