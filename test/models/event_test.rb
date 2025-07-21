require 'test_helper'

class EventTest < ActiveSupport::TestCase
  test 'initial state' do
    date = Time.zone.local(2024, 3, 24)
    travel_to date
    user = create :user
    event = Event.create!(name: 'Test event', responsible: user, starts_at: Time.zone.today)
    assert_equal 'draft', event.status
    assert_equal 'Test event', event.name
    assert_equal 2500, event.range_from
    assert_equal 1500, event.range_to
    assert_not event.apply_penalty_to_score
    assert_equal 'on_9_sec', event.designated_lane_start
  end

  test 'changes visibility to public from private makes tracks public' do
    event = create :event, visibility: Event.visibilities[:private_event]
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
    event = create :event, visibility: Event.visibilities[:public_event]
    section = create :event_section, event: event
    competitor = create :event_competitor, section: section
    round = create :event_round, event: event
    track = create :empty_track, visibility: Track.visibilities[:public_track]
    create :event_result, competitor: competitor, round: round, track: track

    event.private_event!
    track.reload

    assert_predicate track, :unlisted_track?
  end

  test 'permanently_delete removes event and associated records' do
    event = events(:nationals)
    section = event.sections.first
    round = event.rounds.first

    3.times do
      create(
        :event_result,
        round: round,
        competitor: create(:event_competitor, event: event, section: section),
        track: create(:empty_track)
      )
    end

    event.permanently_delete

    assert_predicate event, :destroyed?
    assert_empty Event::Section.where(event: event)
    assert_empty Event::Competitor.where(event: event)
    assert_empty Event::Round.where(event: event)
    assert_empty Event::Result.where(round: event.rounds)

    tracks = Track.includes(event_result: :round)
                  .where(event_results: { event_rounds: { event_id: event.id } })

    assert_empty tracks
  end

  test 'permanently_delete with including_tracks option deletes tracks' do
    event = events(:nationals)
    section = event.sections.first
    round = event.rounds.first

    3.times do
      create(
        :event_result,
        round: round,
        competitor: create(:event_competitor, event: event, section: section),
        track: create(:empty_track)
      )
    end

    track_ids = event.tracks.pluck(:id)

    event.permanently_delete(including_tracks: true)

    assert_predicate event, :destroyed?
    assert_empty Track.where(id: track_ids)
  end
end
