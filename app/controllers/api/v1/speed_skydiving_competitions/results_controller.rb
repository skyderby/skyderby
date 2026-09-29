module Api
  module V1
    module SpeedSkydivingCompetitions
      class ResultsController < Api::ApplicationController
        include Api::SpeedSkydivingCompetitionScoped

        def show
          @result = @event.results.includes(:round, :penalties, competitor: :category).find(params[:id])
          raise ActiveRecord::RecordNotFound unless visible?

          fresh_when etag: [@event, @result, @result.penalties.map(&:updated_at)]
        end

        private

        def visible?
          return true if @event.editable?
          return false if @event.surprise?

          @result.round.completed?
        end
      end
    end
  end
end
