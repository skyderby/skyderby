module Api
  module V1
    class PerformanceCompetitionsController < Api::ApplicationController
      include PerformanceCompetitionBroadcasts

      before_action -> { doorkeeper_authorize! :write }, only: %i[create update]
      before_action :require_registered_user!, only: %i[create update]
      before_action :set_event, only: %i[show update]
      before_action :authorize_event_update!, only: :update

      def show
        fresh_when @event
      end

      def create
        return respond_not_authorized unless PerformanceCompetition.creatable?

        @event = PerformanceCompetition.new(event_params)
        @event.responsible = current_user

        if @event.save
          render :show, status: :created
        else
          render_record_errors @event
        end
      rescue ArgumentError => e
        render_errors [e.message], status: :unprocessable_content
      end

      def update
        if @event.update(event_params)
          if @event.saved_change_to_status?
            broadcast_scoreboards
            broadcast_teams_scoreboard
          end

          render :show
        else
          render_record_errors @event
        end
      rescue ArgumentError => e
        render_errors [e.message], status: :unprocessable_content
      end

      private

      def set_event
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
      end

      def authorize_event_update!
        respond_not_authorized unless @event.editable?
      end

      def render_record_errors(record)
        render_errors record.errors.full_messages, status: :unprocessable_content
      end

      def event_params
        params.require(:event).permit(
          :name,
          :starts_at,
          :place_id,
          :range_from,
          :range_to,
          :status,
          :wind_cancellation,
          :visibility,
          :use_teams,
          :designated_lane_start
        )
      end
    end
  end
end
