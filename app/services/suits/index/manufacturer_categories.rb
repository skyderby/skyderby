module Suits
  module Index
    module ManufacturerCategories
      def popular_manufacturers
        @popular_manufacturers ||= begin
          suit_ids = Track.where('recorded_at > ?', 1.year.ago.beginning_of_day)
                          .where.not(wingsuit_id: nil)
                          .distinct
                          .group(:wingsuit_id)
                          .having('count(wingsuit_id) > 5')
                          .pluck(:wingsuit_id)

          manufacturer_ids = Wingsuit.where(id: suit_ids).pluck(:manufacturer_id)
          Manufacturer.where(id: manufacturer_ids).order(:name)
        end
      end

      def other_manufacturers
        @other_manufacturers ||=
          Manufacturer.where.not(id: popular_manufacturers.ids).order(:name)
      end
    end
  end
end
