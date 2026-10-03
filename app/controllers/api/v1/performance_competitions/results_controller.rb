module Api
  module V1
    module PerformanceCompetitions
      class ResultsController < Api::ApplicationController
        include Api::PerformanceCompetitionScoped
        include PerformanceCompetitionBroadcasts

        before_action -> { doorkeeper_authorize! :write }, except: :show
        before_action :require_registered_user!, except: :show
        before_action :authorize_event_update!, except: :show
        before_action :set_result, only: %i[update destroy]

        def show
          @result =
            @event
            .results
            .includes(:track, round: { reference_point_assignments: :reference_point }, competitor: :category)
            .find(params[:id])
          raise ActiveRecord::RecordNotFound unless visible?

          fresh_when etag: [@event, @result], last_modified: [@event.updated_at, @result.updated_at].max
        end

        def create
          competitor = @event.competitors.find(result_params.require(:competitor_id))
          round = @event.rounds.find(result_params.require(:round_id))
          @result = @event.results.new(competitor:, round:)
          assign_track

          if @result.errors.empty? && @result.save
            broadcast_scoreboards
            render :record, status: :created
          else
            render_record_errors @result
          end
        end

        def update
          @result.track = Track.find(result_params.require(:track_id))
          return render_record_errors(@result) unless track_accessible?(@result.track)

          @result.calc_result if @result.track_id_changed?

          if @result.save
            broadcast_scoreboards
            render :record
          else
            render_record_errors @result
          end
        end

        def destroy
          if @result.destroy
            broadcast_scoreboards
            head :no_content
          else
            render_record_errors @result
          end
        end

        private

        def set_result
          @result = @event.results.find(params[:id])
        end

        def visible?
          return true if @event.editable?
          return false if @event.surprise?

          @result.round.completed || @result.validated?
        end

        def authorize_event_update!
          respond_not_authorized unless @event.editable?
        end

        def render_record_errors(record)
          render_errors record.errors.full_messages, status: :unprocessable_content
        end

        def result_params = params.require(:result).permit(:competitor_id, :round_id, :track_id, :file)

        def assign_track
          if result_params[:file].present?
            @result.track_attributes = { file: result_params[:file] }
          elsif result_params[:track_id].present?
            @result.track = Track.find(result_params[:track_id])
            track_accessible?(@result.track)
          else
            @result.errors.add(:track, :blank)
          end
        end

        def track_accessible?(track)
          return true if track.profile_id.present? && track.profile_id == @result.competitor.profile_id
          return true if track.viewable?

          @result.errors.add(:track, :invalid)
          false
        end
      end
    end
  end
end
