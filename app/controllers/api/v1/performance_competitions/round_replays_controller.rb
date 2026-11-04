module Api
  module V1
    module PerformanceCompetitions
      class RoundReplaysController < Api::ApplicationController
        include Api::PerformanceCompetitionScoped

        def show
          @round = @event.rounds.find(params[:id])
          @available = @round.completed || @event.editable?
          @groups = @available ? grouped_jumps : []
        end

        private

        def grouped_jumps
          @round
            .results
            .where.not(exited_at: nil)
            .includes(competitor: :profile)
            .order(:exited_at)
            .slice_when { |first, second| (first.exited_at - second.exited_at).abs >= ::PerformanceCompetitions::RoundReplaysController::GROUP_SEPARATION }
            .to_a
        end
      end
    end
  end
end
