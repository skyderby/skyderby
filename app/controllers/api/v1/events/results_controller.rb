module Api
  module V1
    module Events
      class ResultsController < Api::ApplicationController
        before_action :set_event

        def index
          authorize @event, :show?

          @results = @event.results
        end

        def create
          authorize @event, :update?

          submission = Event::Result::Submission.new result_params

          respond_to do |format|
            if submission.save
              format.json { @result = submission.result }
            else
              format.json do
                render template: 'errors/api_errors',
                       locals: { errors: submission.errors },
                       status: :bad_request
              end
            end
          end
        end

        private

        def set_event
          @event = Event.find(params[:event_id])
        end

        def result_params
          params.permit(
            :event_id,
            :competitor_id,
            :competitor_name,
            :round_id,
            :round_name,
            :penalized,
            :penalty_size,
            :penalty_reason,
            :reference_point_name,
            track_attributes: [:file],
            jump_range: [:exit_time, :deploy_time]
          )
        end
      end
    end
  end
end
