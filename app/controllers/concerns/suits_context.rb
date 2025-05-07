module SuitsContext
  extend ActiveSupport::Concern

  def set_manufacturers
    suit_ids = Track.where('recorded_at > ?', 1.year.ago.beginning_of_day)
                    .where.not(suit_id: nil)
                    .distinct
                    .group(:suit_id)
                    .having('count(suit_id) > 5')
                    .pluck(:suit_id)

    manufacturer_ids = Suit.where(id: suit_ids).pluck(:manufacturer_id)

    @popular_manufacturers = Manufacturer.where(id: manufacturer_ids).order(:name)
    @other_manufacturers = Manufacturer.where.not(id: @popular_manufacturers.ids).order(:name)
  end
end
