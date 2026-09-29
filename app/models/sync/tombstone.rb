class Sync::Tombstone < ApplicationRecord
  scope :for_resource, ->(resource) { where(resource:) }

  def self.prune(before: Sync::TOMBSTONE_RETENTION.ago)
    where(deleted_at: ...before).delete_all
  end
end
