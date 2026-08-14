require 'test_helper'

class ParticipantOfEventsTest < ActiveSupport::TestCase
  setup do
    @responsible = users(:event_responsible)
    @boogie = Boogie.find(events(:boogie).id)
    @competition = PerformanceCompetition.find(events(:nationals).id)
  end

  test 'responsible of a boogie is an organizer of it' do
    assert @responsible.organizer_of_event?(@boogie)
  end

  test 'responsible of a performance competition is an organizer of it' do
    assert @responsible.organizer_of_event?(@competition)
  end

  test 'other pilots are not organizers' do
    assert_not users(:regular_user).organizer_of_event?(@boogie)
  end

  test 'organizer of a boogie can view its private tracks' do
    track = Track.find(tracks(:boogie_track_1).id)
    track.update!(visibility: :private_track, owner: @boogie)

    assert track.viewable?(@responsible)
    assert_not track.viewable?(users(:regular_user))
  end
end
