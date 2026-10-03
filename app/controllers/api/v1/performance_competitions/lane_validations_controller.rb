class Api::V1::PerformanceCompetitions::LaneValidationsController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped

  GROUP_SEPARATION = 2.minutes

  before_action :require_registered_user!

  def show
    @rounds = @event.rounds.ordered.to_a
    @round = @rounds.find { |round| round.id == params[:id].to_i } || raise(ActiveRecord::RecordNotFound)
    @editable = @event.editable?
    @available = @editable || @round.completed
    @grouped_jumps = @available ? grouped_jumps : []
  end

  private

  def grouped_jumps
    @round
      .results
      .includes(:track, competitor: %i[profile competitor_alias])
      .includes(round: { reference_point_assignments: :reference_point })
      .order(:exited_at)
      .slice_when { |first, second| separate_groups?(first.exited_at, second.exited_at) }
      .to_a
  end

  def separate_groups?(first, second)
    return first.nil? != second.nil? if first.nil? || second.nil?

    (first - second).abs >= GROUP_SEPARATION
  end
end
