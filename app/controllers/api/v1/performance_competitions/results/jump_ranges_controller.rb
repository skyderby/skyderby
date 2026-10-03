class Api::V1::PerformanceCompetitions::Results::JumpRangesController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement

  def update
    @result = @event.results.find(params[:result_id])

    @result.transaction do
      @result.track.update!(track_attributes)
      @result.calc_result
      @result.save!
    end

    render 'api/v1/performance_competitions/results/record'
  rescue ActiveRecord::RecordInvalid => e
    render_record_errors e.record
  end

  private

  def jump_range_params = params.require(:jump_range)

  def track_attributes
    attributes = {
      jump_range: "#{Float(jump_range_params.require(:ff_start))};#{Float(jump_range_params.require(:ff_end))}"
    }
    attributes[:landing_fl_time] = jump_range_params[:landing_fl_time] if jump_range_params.key?(:landing_fl_time)
    attributes
  end
end
