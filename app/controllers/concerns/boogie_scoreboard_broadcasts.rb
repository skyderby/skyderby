module BoogieScoreboardBroadcasts
  extend ActiveSupport::Concern

  private

  def broadcast_scoreboards
    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :scoreboard, :editable],
      target: 'scoreboard',
      partial: 'boogies/scoreboard',
      locals: { event: @event, editable: !@event.finished? }
    )

    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :scoreboard, :read_only],
      target: 'scoreboard',
      partial: 'boogies/scoreboard',
      locals: { event: @event, editable: false }
    )
  end
end
