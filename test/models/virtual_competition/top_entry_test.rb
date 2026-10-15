require 'test_helper'

class VirtualCompetition::TopEntryTest < ActiveSupport::TestCase
  setup do
    @competition = virtual_competitions(:distance_in_time)
    @competition.update!(period_to: nil)
    @track = tracks(:hellesylt)
    @track.update!(recorded_at: Time.current)
    @competition.results.create!(track: @track, result: 2000)
  end

  test 'records a top ten entry of the current season' do
    assert_difference -> { VirtualCompetition::TopEntry.count }, 1 do
      VirtualCompetition::TopEntry.record(@track)
    end

    entry = VirtualCompetition::TopEntry.last
    assert_equal [@competition, profiles(:regular_user), 1, Time.current.year],
                 [entry.virtual_competition, entry.profile, entry.rank, entry.year]
  end

  test 'records an entry once' do
    VirtualCompetition::TopEntry.record(@track)

    assert_no_difference -> { VirtualCompetition::TopEntry.count } do
      VirtualCompetition::TopEntry.record(@track)
    end
  end

  test 'ignores jumps of past seasons' do
    @track.update!(recorded_at: 1.year.ago)

    assert_no_difference -> { VirtualCompetition::TopEntry.count } do
      VirtualCompetition::TopEntry.record(@track)
    end
  end

  test 'ignores results outside the top ten' do
    10.times do |index|
      track = Track.create!(pilot: Profile.create!(name: "Pilot #{index}"), kind: :base, recorded_at: Time.current)
      @competition.results.create!(track:, result: 3000 + index)
    end

    assert_no_difference -> { VirtualCompetition::TopEntry.count } do
      VirtualCompetition::TopEntry.record(@track)
    end
  end

  test 'ignores private tracks' do
    @track.update_column(:visibility, Track.visibilities[:private_track])

    assert_no_difference -> { VirtualCompetition::TopEntry.count } do
      VirtualCompetition::TopEntry.record(@track)
    end
  end
end
