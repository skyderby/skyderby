module Api
  module V1
    module Tournaments
      class MatchesController < Api::ApplicationController
        include Api::TournamentManagement

        SLOT_ATTRIBUTES = %i[is_winner is_disqualified is_lucky_looser earn_medal notes].freeze

        before_action :set_match

        def update
          assign_match_attributes
          assign_slots_attributes

          if @match.errors.none? && @match.save
            render :show
          else
            render_record_errors @match
          end
        rescue ArgumentError => e
          render_errors [e.message], status: :unprocessable_content
        end

        def destroy
          if @match.destroy
            head :no_content
          else
            render_record_errors @match
          end
        end

        private

        def set_match
          @match = @tournament.matches.find(params[:id])
        end

        def match_params
          @match_params ||= params.require(:match).permit(
            :start_time,
            :match_type,
            slots: [:id, :competitor_id, *SLOT_ATTRIBUTES]
          )
        end

        def assign_match_attributes
          if match_params.key?(:start_time)
            start_time = match_params[:start_time]
            start_time.blank? ? @match.start_time_in_seconds = nil : @match.start_time = start_time
          end
          @match.match_type = match_params[:match_type] if match_params.key?(:match_type)
        end

        def assign_slots_attributes
          Array(match_params[:slots]).each do |attributes|
            slot = @match.slots.find { |candidate| candidate.id == attributes[:id].to_i }
            next @match.errors.add(:slots, :invalid) unless slot

            assign_slot_competitor(slot, attributes)
            slot.assign_attributes(attributes.slice(*SLOT_ATTRIBUTES))
          end
        end

        def assign_slot_competitor(slot, attributes)
          return unless attributes.key?(:competitor_id)

          competitor_id = attributes[:competitor_id]
          return slot.competitor = nil if competitor_id.blank?

          competitor = @tournament.competitors.find_by(id: competitor_id)
          competitor ? slot.competitor = competitor : @match.errors.add(:slots, :invalid)
        end
      end
    end
  end
end
