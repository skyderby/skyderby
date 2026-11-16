class TrackPointsBackfillJob < ApplicationJob
  RESTORE_BATCH_SIZE = 50

  def perform(track_ids)
    Track::Points.copy_from_legacy!(track_ids)
    Track::SensorSeries.copy_from_legacy!(track_ids)
    restore_accuracy(track_ids)
  end

  private

  def restore_accuracy(track_ids)
    Track::Points.restorable_from_files
                 .where(track_id: track_ids)
                 .select(:track_id, :gps_time, :horizontal_accuracy)
                 .includes(track: :track_file)
                 .find_each(batch_size: RESTORE_BATCH_SIZE) do |points|
                   points.restore_accuracy_from_file
                 rescue StandardError => e
                   Rails.error.report(e, handled: true, context: { track_id: points.track_id })
    end
  end
end
