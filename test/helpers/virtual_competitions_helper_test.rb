require 'test_helper'

class VirtualCompetitionsHelperTest < ActionView::TestCase
  test 'competition_badge renders tournament base race' do
    competition = Tracks::TournamentBaseRace.new(tournaments(:qualification_loen))

    assert_equal t('virtual_competitions.badges.base_race', parameter: 0), competition_badge(competition)
  end
end
