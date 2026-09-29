module Sync
  RESOURCES = %w[countries manufacturers suits places place_finish_lines].freeze
  TOMBSTONE_RETENTION = 180.days
  COMMIT_OVERLAP = 5.seconds
  DEFAULT_LIMIT = 1000

  def self.table_name_prefix = 'sync_'

  def self.resource_class(resource)
    {
      'countries' => Country,
      'manufacturers' => Manufacturer,
      'suits' => Suit,
      'places' => Place,
      'place_finish_lines' => Place::FinishLine
    }.fetch(resource.to_s)
  end
end
