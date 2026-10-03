module Api
  module V1
    class SpeedSkydivingCompetitionsController < Api::ApplicationController
      include SpeedSkydivingCompetitionBroadcasts

      before_action :set_event, only: :update
      before_action -> { doorkeeper_authorize! :write }, only: %i[create update]
      before_action :require_registered_user!, only: %i[create update]
      before_action :authorize_event_create!, only: :create
      before_action :authorize_event_update!, only: :update

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

      def create
        @event = SpeedSkydivingCompetition.new(event_params)
        @event.responsible = current_user

        if @event.save
          render :show, status: :created
        else
          render_errors @event.errors.full_messages, status: :unprocessable_content
        end
      end

      def update
        if @event.update(event_params)
          broadcast_status_change if @event.saved_change_to_status?
          render :show
        else
          render_errors @event.errors.full_messages, status: :unprocessable_content
        end
      end

      private

      def set_event
        @event = SpeedSkydivingCompetition.find(params[:id])
        raise ActiveRecord::RecordNotFound unless @event.viewable?
      end

      def authorize_event_create!
        respond_not_authorized unless SpeedSkydivingCompetition.creatable?
      end

      def authorize_event_update!
        respond_not_authorized unless @event.editable?
      end

      def broadcast_status_change
        broadcast_scoreboard
        broadcast_actions_bar
      end

      def event_params
        params.require(:event).permit(:name, :starts_at, :place_id, :status, :visibility, :use_teams)
      end
    end
  end
end
