require 'application_system_test_case'

class SuitsIndexTest < ApplicationSystemTestCase
  test 'Access by any user' do
    visit suits_path

    assert_selector('.suits-index li.active > a', text: 'Overview')
  end
end
