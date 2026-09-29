module Api
  module V1
    class SpeedSkydivingCompetitionsController < Api::ApplicationController
      def show
        @event =
          SpeedSkydivingCompetition
          .includes(
            :categories, :teams,
            place: :country,
            organizers: { user: :profile },
            sponsors: { logo_attachment: :blob }
          )
          .find(params[:id])
        raise ActiveRecord::RecordNotFound unless @event.viewable?

        fresh_when @event
      end
    end
  end
end
