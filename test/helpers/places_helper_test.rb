require 'test_helper'

class PlacesHelperTest < ActionView::TestCase
  test 'returns place presentation with country code' do
    place = places(:hellesylt)

    expected_output =
      '<span>Hellesylt</span> (<span class="text-warning" data-toggle="tooltip" title="Norway">NOR</span>)'
    assert_equal expected_output, place_presentation(place)
  end
end
