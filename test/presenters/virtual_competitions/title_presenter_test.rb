require 'test_helper'

class VirtualCompetitions::TitlePresenterTest < ActiveSupport::TestCase
  test 'with group' do
    group = create :virtual_competition_group, name: 'WTF'
    competition = create :virtual_competition, name: 'Gridset race', group: group

    title = VirtualCompetitions::TitlePresenter.call(competition)
    assert_equal 'WTF - Gridset race', title
  end
end
