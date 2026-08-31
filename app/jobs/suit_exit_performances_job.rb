class SuitExitPerformancesJob < ApplicationJob
  def perform
    Suit::ExitPerformance.refresh_all
  end
end

Sidekiq.configure_server do
  Sidekiq::Cron::Job.create(
    name: 'Refresh suit exit performances - daily',
    cron: '30 1 * * *',
    class: 'SuitExitPerformancesJob'
  )
end
