module Api
  module V1
    module Tournaments
      class QualificationResultsController < Api::ApplicationController
        include Api::TournamentManagement

        def create
          @result = build_result

          if @result.errors.none? && @result.save
            render :show, status: :created
          else
            render_record_errors @result
          end
        end

        def destroy
          result = @tournament.qualification_jumps.find(params[:id])

          if result.destroy
            broadcast_qualification_scoreboard
            head :no_content
          else
            render_record_errors result
          end
        end

        private

        def result_params
          @result_params ||= params.require(:result).permit(:qualification_round_id, :competitor_id, :track_id, :file)
        end

        def build_result
          round = @tournament.qualification_rounds.find(result_params[:qualification_round_id])
          competitor = @tournament.competitors.find_by(id: result_params[:competitor_id])
          round.qualification_jumps.new(competitor:).tap { |result| assign_track(result) }
        end

        def assign_track(result)
          if result_params[:file].present?
            result.track_attributes = { file: result_params[:file] } if result.competitor
          elsif result_params[:track_id].present?
            result.track = Track.find(result_params[:track_id])
          else
            result.errors.add(:track, :blank)
          end
        end
      end
    end
  end
end
