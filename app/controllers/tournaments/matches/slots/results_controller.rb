module Tournaments
  module Matches
    module Slots
      class ResultsController < ApplicationController
        include TournamentScoped

        before_action :set_match, :set_slot

        def show
          authorize @tournament, :show?

          respond_to do |format|
            format.html { redirect_to @slot.track }
            format.turbo_stream
          end
        end

        def new
          authorize @tournament, :edit?

          respond_to do |format|
            format.turbo_stream
          end
        end

        def create
          authorize @tournament, :edit?

          respond_to do |format|
            if @slot.update(result_params)
              format.turbo_stream { respond_with_scoreboard }
            else
              format.turbo_stream { respond_with_errors @slot }
            end
          end
        end

        def destroy
          authorize @tournament, :edit?

          respond_to do |format|
            if @slot.update(destroy_params)
              format.turbo_stream { respond_with_scoreboard }
            else
              format.turbo_stream { respond_with_errors @slot }
            end
          end
        end

        private

        def set_match
          @match = @tournament.matches.find(params[:match_id])
        end

        def set_slot
          @slot = @match.slots.find(params[:slot_id])
        end

        def destroy_params
          {
            track: nil,
            result: nil,
            is_disqualified: false,
            notes: ''
          }
        end

        def result_params
          params.require(:tournament_match_slot).permit(
            :track_id,
            :track_from,
            track_attributes: [:file]
          )
        end
      end
    end
  end
end
