class SyncTombstonesPruneJob < ApplicationJob
  def perform
    Sync::Tombstone.prune
  end
end

Sidekiq.configure_server do
  Sidekiq::Cron::Job.create(
    name: 'Prune sync tombstones - daily',
    cron: '15 2 * * *',
    class: 'SyncTombstonesPruneJob'
  )
end
