module Api
  module V1
    class BoogiesController < Api::ApplicationController
      def show
        @event =
          Boogie
          .includes(
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
