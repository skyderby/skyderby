class Event::Result < ApplicationRecord
  module SubmissionResult
    extend ActiveSupport::Concern

    included do
      before_create :calculate_result
    end

    def calculate_result
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
