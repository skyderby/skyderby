require 'test_helper'

class EventTest < ActiveSupport::TestCase
  test 'initial state' do
    date = Time.zone.local(2024, 3, 24)
    travel_to date
    user = create :user
    event = PerformanceCompetition.create!(responsible: user, starts_at: Time.zone.today)
    assert_equal 'draft', event.status
    assert_equal '24.03.2024: Competition', event.name
    assert_equal 2500, event.range_from
    assert_equal 1500, event.range_to
    assert_not event.apply_penalty_to_score
    assert_equal 'on_10_sec', event.designated_lane_start
  end

  test 'changes visibility to public from private makes tracks public' do
    event = create :event, visibility: PerformanceCompetition.visibilities[:private_event]
    section = create :event_section, event: event
    competitor = create :event_competitor, section: section
    round = create :event_round, event: event
    track = create :empty_track, visibility: Track.visibilities[:unlisted_track]
    create :event_result, competitor: competitor, round: round, track: track

    event.public_event!
    track.reload

    assert_predicate track, :public_track?
  end

  test 'changes visibility to unlisted from public makes tracks unlisted' do
    event = create :event, visibility: PerformanceCompetition.visibilities[:public_event]
    section = create :event_section, event: event
    competitor = create :event_competitor, section: section
    round = create :event_round, event: event
    track = create :empty_track, visibility: Track.visibilities[:public_track]
    create :event_result, competitor: competitor, round: round, track: track

    event.private_event!
    track.reload

    assert_predicate track, :unlisted_track?
  end
end
