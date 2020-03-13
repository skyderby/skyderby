class VirtualCompetition < ApplicationRecord
  module SuitableFinder
    extend ActiveSupport::Concern

    included do
      scope :by_suit_type, ->(type) {
        where('suits_kind = ? OR suits_kind IS NULL', VirtualCompetition.suits_kinds[type])
      }
      scope :by_activity, ->(activity) {
        where('jumps_kind = ? OR jumps_kind IS NULL', VirtualCompetition.jumps_kinds[activity])
      }
      scope :for_date, ->(date) { where(':date BETWEEN period_from AND period_to', date: date) }
      scope :for_place, ->(place) { place ? by_place(place) : worldwide }
      scope :by_place, ->(place) { where('place_id = ? OR place_id IS NULL', place) }
      scope :worldwide, -> { where(place: nil) }
    end

    class_methods do
      def suitable_for(track)
        return none unless available_for_scoring(track)

        VirtualCompetition.order(:name)
                          .by_activity(track.kind)
                          .by_suit_type(track.suit_kind)
                          .for_place(track.place)
                          .for_date(track.recorded_at)
      end

      private

      def available_for_scoring(track)
        track.public_track? &&
          track.suit &&
          track.pilot &&
          !track.disqualified_from_online_competitions
      end
    end
  end
end
