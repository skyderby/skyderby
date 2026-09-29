module Syncable
  extend ActiveSupport::Concern

  included do
    after_destroy_commit :write_sync_tombstone
  end

  class_methods do
    def sync_resource = table_name
  end

  private

  def write_sync_tombstone
    Sync::Tombstone.create!(resource: self.class.sync_resource, record_id: id)
  end
end
