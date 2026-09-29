module Api
  module V1
    module PerformanceCompetitions
      class TaskScoreboardsController < Api::ApplicationController
        include Api::PerformanceCompetitionScoped

        def show
          raise ActiveRecord::RecordNotFound unless @event.rounds.exists?(discipline: params[:discipline])

          @scoreboard = @event.task_standings(params[:discipline], until_round:, wind_cancellation: wind_cancellation?)
          fresh_when @event
        end
      end
    end
  end
end
