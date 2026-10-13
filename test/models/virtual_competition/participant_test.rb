require 'test_helper'

class VirtualCompetition::ParticipantTest < ActiveSupport::TestCase
  include ActionCable::TestHelper

  setup do
    @participant = virtual_competition_participants(:regular_user_in_feather_challenge)
    @competition = @participant.virtual_competition
  end

  test 'scanning tracks scores them and refreshes the participants list' do
    track = create_track_from_file '06-38-21_SimonP.CSV', kind: :base, pilot: profiles(:regular_user)

    assert_broadcasts "#{@competition.to_gid_param}:participants", 1 do
      @participant.score_tracks
    end

    assert_predicate @participant, :tracks_scanned?
    assert @competition.results.exists?(track:)
  end

  test 'removing a participant deletes their results' do
    track = create :empty_track, kind: Track.kinds[:base], pilot: profiles(:regular_user)
    virtual_competition_disciplines(:feather_challenge_distance).results.create!(track:, result: 100)

    @participant.destroy!

    assert_not @competition.results.exists?(track:)
  end
end
