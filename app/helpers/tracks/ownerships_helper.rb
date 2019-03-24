module Tracks
  module OwnershipsHelper
    def track_ownership_type_options
      Track::Ownership::TYPES.map do |type|
        [
          I18n.t("activerecord.models.#{type.downcase}", default: '—'),
          type
        ]
      end
    end
  end
end
