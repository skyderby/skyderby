module Api
  module TournamentJumpRange
    extend ActiveSupport::Concern

    private

    def jump_range_params
      @jump_range_params ||= params.require(:jump_range)
    end

    def assign_jump_range(track)
      ff_start, ff_end = jump_range_params.values_at(:ff_start, :ff_end)
      track.jump_range = "#{ff_start};#{ff_end}" if ff_start.present? && ff_end.present?
      track.landing_fl_time = jump_range_params[:landing_fl_time] if jump_range_params.key?(:landing_fl_time)
    end
  end
end
