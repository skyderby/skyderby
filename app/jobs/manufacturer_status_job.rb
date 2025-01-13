class ManufacturerStatusJob < ApplicationJob
  def perform
    Manufacturer.transaction do
      Manufacturer.where(id: active_manufacturers).update(active: true)
      Manufacturer.where.not(id: active_manufacturers).update(active: false)
    end
  end

  private

  def active_manufacturers
    @active_manufacturers ||=
      Manufacturer
      .left_joins(suits: :tracks)
      .group('manufacturers.id')
      .having('count(tracks.id) > 5')
      .where("tracks.recorded_at > NOW() - interval '1 year'")
  end
end
