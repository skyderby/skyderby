class CreateGpsRecordingsArchiveJob < ApplicationJob
  queue_as :default

  def perform(event)
    archive = event.gps_recordings_archive || event.build_gps_recordings_archive

    return if archive.in_progress?

    archive.create_archive!
  ensure
    archive&.update(status: :complete) if archive&.persisted?
  end
end
