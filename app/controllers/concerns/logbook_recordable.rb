module LogbookRecordable
  extend ActiveSupport::Concern
  include MasqueradingHelper

  private

  def record_in_logbook(track, requested)
    return unless ActiveModel::Type::Boolean.new.cast(requested)
    return if masquerading? || !track.loggable?

    Jump.record_track(track)
  end
end
