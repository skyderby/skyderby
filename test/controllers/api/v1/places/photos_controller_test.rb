require 'test_helper'

class Api::V1::Places::PhotosControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup { @place = places(:hellesylt) }

  test '#create uploads a photo for place editors' do
    assert_difference -> { @place.photos.count }, 1 do
      post api_v1_place_photos_path(@place),
           params: { image: fixture_file_upload('profile_userpic.png', 'image/png') }, headers: bearer(:admin_write)
    end

    assert_response :created
    assert_predicate response.parsed_body['thumbUrl'], :present?
  end

  test '#create is refused to regular users' do
    post api_v1_place_photos_path(@place),
         params: { image: fixture_file_upload('profile_userpic.png', 'image/png') },
         headers: bearer(:regular_user_write)

    assert_response :forbidden
  end

  test '#destroy removes the photo' do
    photo = @place.photos.create!(image: fixture_file_upload('profile_userpic.png', 'image/png'))

    delete api_v1_place_photo_path(@place, photo), headers: bearer(:admin_write)

    assert_response :no_content
    assert_not Place::Photo.exists?(photo.id)
  end

  test 'place details tell editors they can manage photos' do
    get api_v1_place_path(@place), headers: bearer(:admin_read)

    assert response.parsed_body['photosEditable']
  end
end
