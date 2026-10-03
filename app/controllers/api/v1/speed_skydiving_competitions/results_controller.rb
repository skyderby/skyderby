module Api
  module V1
    module SpeedSkydivingCompetitions
      class ResultsController < Api::ApplicationController
        include Api::SpeedSkydivingCompetitionScoped
        include SpeedSkydivingCompetitionBroadcasts

        before_action -> { doorkeeper_authorize! :write }, except: :show
        before_action :require_registered_user!, except: :show
        before_action :authorize_event_update!, except: :show

        def show
          @result = @event.results.includes(:round, :penalties, competitor: :category).find(params[:id])
          raise ActiveRecord::RecordNotFound unless visible?

          fresh_when etag: [@event, @result, @result.penalties.to_a]
        end

        def create
          @result = @event.results.new(create_params)
          return respond_not_authorized if @result.track && !track_accessible?

          if @result.save
            broadcast_scoreboard
            render :show, status: :created
          else
            render_errors @result.errors.full_messages, status: :unprocessable_content
          end
        end

        def destroy
          result = @event.results.find(params[:id])

          if result.destroy
            broadcast_scoreboard
            head :no_content
          else
            render_errors result.errors.full_messages, status: :unprocessable_content
          end
        end

        private

        def authorize_event_update!
          respond_not_authorized unless @event.editable?
        end

        def visible?
          return true if @event.editable?
          return false if @event.surprise?

          @result.round.completed?
        end

        def create_params
          permitted = params.require(:result).permit(:competitor_id, :round_id, :track_id, :file)

          {
            competitor: @event.competitors.find(permitted.require(:competitor_id)),
            round: @event.rounds.find(permitted.require(:round_id))
          }.merge(track_source(permitted))
        end

        def track_source(permitted)
          return { track: Track.find(permitted[:track_id]) } if permitted[:track_id].present?

          { track_attributes: { file: permitted[:file] } }
        end

        def track_accessible?
          @result.track.pilot == @result.competitor.profile || @result.track.viewable?
        end
      end
    end
  end
end
