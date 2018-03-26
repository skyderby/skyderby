class EventTrack
  module SubmissionResult
    extend ActiveSupport::Concern

    included do
      before_save :calc_result, on: :create
    end

    def calc_result
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
