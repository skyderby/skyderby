class PerformanceCompetitions::Downloads::GpsRecordingsController < ApplicationController
  include BearerTokenAuthentication
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def show
    archive = @event.gps_recordings_archive

    if archive&.complete? && archive.file.attached?
      redirect_to rails_blob_path(archive.file, disposition: :attachment)
    elsif bearer_token?
      head :accepted
    else
      render turbo_stream: turbo_stream.append(
        :toasts,
        partial: 'toasts/toast',
        locals: { message: 'File is being generated, please wait.' }
      )
    end
  end
end
