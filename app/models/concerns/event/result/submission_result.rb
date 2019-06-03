class Event::Result < ApplicationRecord
  module SubmissionResult
    extend ActiveSupport::Concern

    included do
      before_create :calc_result
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
