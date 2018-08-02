module Tournaments
  module Matches
    module SlotsHelper
      def match_slot_presentation(slot)
        "#{t('activerecord.models.event/result')}: #{slot.competitor_name} | Round - #{slot.round_order}"
      end
    end
  end
end
