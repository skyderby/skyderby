require 'test_helper'

class LandingPageTest < ActiveSupport::TestCase
  test 'rounds tracks count down to thousands' do
    Track.stub(:maximum, 4321) do
      assert_equal '4000+', LandingPage.new.tracks_count
    end
  end

  test 'returns zero tracks count when there are no tracks' do
    Track.stub(:maximum, nil) do
      assert_equal '0+', LandingPage.new.tracks_count
    end
  end
end
