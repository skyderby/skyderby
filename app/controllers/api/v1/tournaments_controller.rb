module Api
  module V1
    class TournamentsController < Api::ApplicationController
      def show
        @tournament =
          Tournament
          .includes(
            :finish_line,
            place: :country,
            organizers: { user: :profile },
            sponsors: { logo_attachment: :blob },
            competitors: [{ suit: :manufacturer }, { sponsor_logo_attachment: :blob }]
          )
          .find(params[:id])
        raise ActiveRecord::RecordNotFound unless @tournament.viewable?

        fresh_when etag: [
          @tournament,
          @tournament.competitors.map(&:updated_at).max,
          @tournament.competitors.size,
          @tournament.rounds.exists?
        ]
      end
    end
  end
end
