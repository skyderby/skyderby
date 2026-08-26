require 'test_helper'

class Place::SubmissionTest < ActiveSupport::TestCase
  test 'destroying a place removes its submission' do
    place = Place.create!(name: 'User place', country: countries(:norway), latitude: 10, longitude: 10)
    submission = Place::Submission.create!(place: place, user: users(:regular_user))

    place.destroy

    assert_not Place::Submission.exists?(submission.id)
  end
end
