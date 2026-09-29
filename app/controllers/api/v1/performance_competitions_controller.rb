module Api
  module V1
    class PerformanceCompetitionsController < Api::ApplicationController
      def show
        @event =
          PerformanceCompetition
          .includes(
            :reference_points, :teams,
            place: :country,
            organizers: { user: :profile },
            sponsors: { logo_attachment: :blob },
            categories: { competitors: { suit: :manufacturer } }
          )
          .find(params[:id])
        raise ActiveRecord::RecordNotFound unless @event.viewable?

        fresh_when @event
      end
    end
  end
end
