module SpeedSkydivingCompetitionScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_event
  end

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

  def broadcast_scoreboard
    Turbo::StreamsChannel.broadcast_replace_to @event, :scoreboard, :editable,
                                               target: 'scoreboard',
                                               partial: 'speed_skydiving_competitions/scoreboard',
                                               locals: { event: @event, editable: !@event.finished? }

    Turbo::StreamsChannel.broadcast_replace_to @event, :scoreboard, :read_only,
                                               target: 'scoreboard',
                                               partial: 'speed_skydiving_competitions/scoreboard',
                                               locals: { event: @event, editable: false }
  end
end
