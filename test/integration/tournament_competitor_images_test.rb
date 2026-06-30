require 'test_helper'

class TournamentCompetitorImagesTest < ActionDispatch::IntegrationTest
  setup do
    @tournament = tournaments(:world_base_race)
    @suit = suits(:apache)
    sign_in users(:regular_user)
  end

  test 'new competitor form renders image fields' do
    get new_tournament_competitor_path(@tournament), as: :turbo_stream

    assert_response :success
    assert_match 'tournament_competitor[photo]', response.body
    assert_match 'tournament_competitor[sponsor_logo]', response.body
  end

  test 'creates competitor with photo and sponsor logo' do
    photo = fixture_file_upload('profile_userpic.png', 'image/png')
    logo = fixture_file_upload('skyderby_logo.png', 'image/png')

    assert_difference -> { @tournament.competitors.count }, 1 do
      post tournament_competitors_path(@tournament), params: {
        tournament_competitor: {
          suit_id: @suit.id,
          photo: photo,
          sponsor_logo: logo,
          profile_attributes: { name: 'Image Tester' }
        }
      }
    end

    competitor = @tournament.competitors.order(:id).last
    assert_predicate competitor.photo, :present?, 'photo should be attached'
    assert_predicate competitor.sponsor_logo, :present?, 'sponsor logo should be attached'
  end
end
