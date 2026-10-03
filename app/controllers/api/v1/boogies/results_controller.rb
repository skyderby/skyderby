module Api
  module V1
    module Boogies
      class ResultsController < Api::ApplicationController
        include Api::BoogieScoped
        include Api::EventManagement
        include BoogieScoreboardBroadcasts

        before_action :set_result, only: %i[update destroy]

        def create
          competitor = @event.competitors.find(result_params[:competitor_id])
          round = @event.rounds.find(result_params[:round_id])
          @result = round.results.new(competitor:, **track_source(competitor))

          if @result.save
            broadcast_scoreboards
            render :show, status: :created
          else
            render_record_errors @result
          end
        end

        def update
          @result.track = accessible_track(@result.competitor)
          @result.calc_result if @result.track && @result.track_id_changed?

          if @result.save
            broadcast_scoreboards
            render :show
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

        def result_params
          params.require(:result).permit(:competitor_id, :round_id, :track_id, :track_from, :file)
        end

        def track_source(competitor)
          if track_from_file?
            { track_attributes: { file: result_params[:file] } }
          else
            { track: accessible_track(competitor) }
          end
        end

        def track_from_file?
          case result_params[:track_from]
          when 'from_file' then true
          when 'existing_track' then false
          else result_params[:file].present?
          end
        end

        def accessible_track(competitor)
          return if result_params[:track_id].blank?

          track = Track.find(result_params[:track_id])
          raise ActiveRecord::RecordNotFound unless track.profile_id == competitor.profile_id || track.viewable?

          track
        end
      end
    end
  end
end
