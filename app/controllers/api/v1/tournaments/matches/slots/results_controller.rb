module Api
  module V1
    module Tournaments
      module Matches
        module Slots
          class ResultsController < Api::ApplicationController
            include Api::TournamentManagement

            before_action :set_slot

            def create
              assign_track

              if @slot.errors.none? && @slot.save
                render 'api/v1/tournaments/slots/show', status: :created
              else
                render_record_errors @slot
              end
            end

            def destroy
              if @slot.update(track: nil, result: nil, is_disqualified: false, notes: '')
                head :no_content
              else
                render_record_errors @slot
              end
            end

            private

            def set_slot
              @match = @tournament.matches.find(params[:match_id])
              @slot = @match.slots.find(params[:slot_id])
            end

            def result_params
              @result_params ||= params.require(:result).permit(:track_id, :file)
            end

            def assign_track
              return @slot.errors.add(:competitor, :blank) unless @slot.competitor

              if result_params[:file].present?
                @slot.track_attributes = { file: result_params[:file] }
              elsif result_params[:track_id].present?
                @slot.track = Track.find(result_params[:track_id])
              else
                @slot.errors.add(:track, :blank)
              end
            end
          end
        end
      end
    end
  end
end
