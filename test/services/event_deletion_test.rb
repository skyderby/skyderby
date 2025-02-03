require 'test_helper'

class EventDeletionTest < ActiveSupport::TestCase
  setup do
    @event = events(:nationals)
    section = @event.sections.first
    round = @event.rounds.first

    3.times do
      create(
        :event_result,
        round: round,
        competitor: create(:event_competitor, event: @event, section: section),
        track: create(:empty_track)
      )
    end
  end

  test 'deletes event' do
    EventDeletion.execute(@event)

    assert_predicate @event, :destroyed?
    assert_empty PerformanceCompetition::Section.where(event: @event)
    assert_empty PerformanceCompetition::Competitor.where(event: @event)
    assert_empty PerformanceCompetition::Round.where(event: @event)
    assert_empty PerformanceCompetition::Result.where(round: @event.rounds)

    tracks = Track.includes(event_result: :round)
                  .where(event_results: { event_rounds: { event_id: @event.id } })

    assert_empty tracks
  end
end
