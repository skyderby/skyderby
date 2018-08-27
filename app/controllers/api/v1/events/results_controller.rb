module Api
  module V1
    module Events
      class ResultsController < ApplicationController
        def create
          event = Event.find(params[:event_id])

          authorize event, :update?

          @result = event.results.new result_params
          @result.current_user = current_user

          respond_to do |format|
            if @result.save
              format.json
            else
              format.json { render template: 'errors/api_errors', locals: { errors: @result.errors }, status: :bad_request }
            end
          end
        end

        def result_params
          params.permit(
            :competitor_id,
            :round_id,
            :penalized,
            :penalty_size,
            :penalty_reason,
            track_attributes: [:file]
          ).merge(track_from: 'from_file')
        end
      end
    end
  end
end
