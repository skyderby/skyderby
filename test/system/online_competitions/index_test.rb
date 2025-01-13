require 'application_system_test_case'

class OnlineCompetitionsIndexTest < ApplicationSystemTestCase
  test 'shows competitions' do
    competition = create :virtual_competition

    visit virtual_competitions_path

    assert_text competition.name
  end
end
