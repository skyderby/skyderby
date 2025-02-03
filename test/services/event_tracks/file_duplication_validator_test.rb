require 'test_helper'

class EventTracks::FileDuplicationValidatorTest < ActiveSupport::TestCase
  setup do
    @user = users(:event_responsible)
    @event = PerformanceCompetition.create!(name: 'Where duplicate occurs', responsible: @user, starts_at: 1.day.ago)
    @suit = suits(:apache)
    @category = @event.sections.create!(name: 'Open')
    @profile = Profile.create!(name: 'PILOT_NAME')
    @competitor = @event.competitors.create!(section: @category, profile: @profile, suit: @suit)
  end

  test 'adds error if duplicate found' do
    track = create_track_from_file 'flysight.csv', pilot: @profile, suit: @suit
    round = @event.rounds.create!(discipline: :distance, number: 2)
    event_track = round.results.create! \
      competitor: @competitor,
      track: track,
      result: 200,
      uploaded_by: @user.profile

    track_file = Track::File.create!(file: File.open(file_fixture('tracks/flysight.csv')))

    EventTracks::FileDuplicationValidator.call(event_track, track_file)

    assert_not_empty event_track.errors
    assert_equal(
      'File already used. Pilot: PILOT_NAME, round: Distance - 1',
      event_track.errors.full_messages.first
    )
  end

  test 'returns false if no duplicates found' do
    round = @event.rounds.create!(discipline: :distance, number: 1)
    result = round.results.create! \
      competitor: @competitor,
      track: create_track_from_file('distance_2454.csv', pilot: @profile, suit: @suit),
      result: 300,
      uploaded_by: @user.profile

    track_file = Track::File.create!(file: File.open(file_fixture('tracks/flysight.csv')))

    EventTracks::FileDuplicationValidator.call(result, track_file)

    assert_empty result.errors
  end
end
