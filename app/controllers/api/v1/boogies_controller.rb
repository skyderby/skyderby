module Api
  module V1
    class BoogiesController < Api::ApplicationController
      include BoogieScoreboardBroadcasts

      before_action -> { doorkeeper_authorize! :write }, only: %i[create update]
      before_action :require_registered_user!, only: %i[create update]

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

      def create
        return respond_not_authorized unless Boogie.creatable?

        @event = Boogie.new(responsible: current_user)
        return unless assign_event_attributes

        if @event.save
          render :show, status: :created
        else
          render_errors @event.errors.full_messages, status: :unprocessable_content
        end
      end

      def update
        @event = Boogie.find(params[:id])
        raise ActiveRecord::RecordNotFound unless @event.viewable?
        return respond_not_authorized unless @event.editable?

        return unless assign_event_attributes

        if @event.save
          broadcast_scoreboards if @event.saved_change_to_status?
          render :show
        else
          render_errors @event.errors.full_messages, status: :unprocessable_content
        end
      end

      private

      def assign_event_attributes
        @event.assign_attributes(event_params)
        true
      rescue ArgumentError => e
        render_errors [e.message], status: :unprocessable_content
        false
      end

      def event_params
        params.require(:event).permit(
          :name, :starts_at, :place_id, :range_from, :range_to, :status, :visibility, :number_of_results_for_total
        )
      end
    end
  end
end
