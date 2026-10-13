require 'test_helper'

class VirtualCompetition::MembershipTest < ActiveSupport::TestCase
  setup do
    @competition = virtual_competitions(:feather_challenge)
  end

  test 'private ranking is viewable by participants and administrators only' do
    assert @competition.viewable?(users(:regular_user))
    assert @competition.viewable?(users(:admin))
    assert @competition.viewable?(users(:event_responsible))
    assert_not @competition.viewable?(users(:places_editor))
    assert_not @competition.viewable?(nil)
  end

  test 'unlisted ranking is viewable by anyone but listed only for members' do
    @competition.update!(visibility: :unlisted_competition)

    assert @competition.viewable?(users(:places_editor))
    assert_includes VirtualCompetition.listable(users(:regular_user)), @competition
    assert_not_includes VirtualCompetition.listable(users(:places_editor)), @competition
  end
end
