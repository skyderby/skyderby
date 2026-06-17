module SpeedSkydivingCompetition::Result::SubmissionResult
  extend ActiveSupport::Concern

  included do
    before_create :calculate_result
  end

  def calculate_result
    score = track.speed_skydiving_result

    assign_attributes(
      result: score.result,
      exit_altitude: score.exit_altitude,
      window_start_time: score.window_start_time,
      window_start_altitude: score.window_start_altitude,
      window_end_time: score.window_end_time,
      window_end_altitude: score.window_end_altitude
    )
  end
end
