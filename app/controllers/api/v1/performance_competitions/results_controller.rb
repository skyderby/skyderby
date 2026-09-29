module Api
  module V1
    module PerformanceCompetitions
      class ResultsController < Api::ApplicationController
        include Api::PerformanceCompetitionScoped

        def show
          @result =
            @event
            .results
            .includes(:track, round: { reference_point_assignments: :reference_point }, competitor: :category)
            .find(params[:id])
          raise ActiveRecord::RecordNotFound unless visible?

          fresh_when etag: [@event, @result], last_modified: [@event.updated_at, @result.updated_at].max
        end

        private

        def visible?
          return true if @event.editable?
          return false if @event.surprise?

          @result.round.completed || @result.validated?
        end
      end
    end
  end
end
