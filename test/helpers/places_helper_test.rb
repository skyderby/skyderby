require 'test_helper'

class PlacesHelperTest < ActionView::TestCase
  test 'returns place presentation with country code' do
    place = places(:hellesylt)

    assert_equal(
      '<span>Hellesylt</span> (<span class="text-warning" data-toggle="tooltip" title="Norway">NOR</span>)',
      place_presentation(place)
    )
  end
end
