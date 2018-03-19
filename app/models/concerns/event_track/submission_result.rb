class EventTrack
  module SubmissionResult
    extend ActiveSupport::Concern

    included do
      before_save :calc_result
    end

    def calc_result
      return unless track_id_changed?

      self.result = EventResultService.new(track, round).calculate

      return unless event.wind_cancellation
      self.result_net = EventResultService.new(
        track,
        round,
        wind_cancellation: true
      ).calculate
    end
  end
end
