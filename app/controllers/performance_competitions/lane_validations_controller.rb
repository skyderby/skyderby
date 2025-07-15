class PerformanceCompetitions::LaneValidationsController < ApplicationController
  GROUP_SEPARATION = 2.minutes

  include EventScoped

  before_action :set_event
  before_action :authorize_event_access!

  def index
    last_round = @event.results.order(created_at: :desc).first&.round

    redirect_to event_lane_validation_path(@event, last_round) if last_round
  end

  def show
    event_rounds = @event.rounds.order(:number, :created_at)
    @rounds_by_discipline = event_rounds.group_by(&:discipline)
    @round = event_rounds.includes(
      :reference_point_assignments,
      results: [:track, { competitor: :profile }]
    ).find(params[:id])

    @grouped_jumps = @round.results.slice_when do |first, second|
      (first.track.start_time - second.track.start_time).abs >= GROUP_SEPARATION
    end
  end
end
