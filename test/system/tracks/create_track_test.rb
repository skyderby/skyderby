require 'application_system_test_case'

class CreateTrackTest < ApplicationSystemTestCase
  test 'upload Flysight file' do
    upload_track 'flysight.csv'

    assert_selector '[aria-label="distance"]', text: '3496'
  end

  test 'upload Flysight2 file' do
    upload_track 'fs2-track.csv'

    assert_selector '[aria-label="distance"]', text: '10334'
  end

  test 'upload Columbus file' do
    upload_track 'columbus.csv'

    assert_selector '[aria-label="distance"]', text: '1262'
  end

  test 'upload Wintec file' do
    upload_track 'wintec.tes'

    assert_selector '[aria-label="distance"]', text: '4984'
  end

  test 'upload Dual XGPS160 file' do
    upload_track 'dual_xgps160.kml'

    assert_selector '[aria-label="distance"]', text: '1203'
  end

  test 'upload Cybereye file' do
    upload_track 'cyber_eye.csv'

    assert_selector '[aria-label="distance"]', text: '8487'
  end

  test 'upload Garmin gpx: one track in file' do
    upload_track 'one_track.gpx'

    assert_selector '[aria-label="distance"]', text: '3955'
  end

  test 'upload Garmin gps: multiple tracks in file' do
    upload_track 'two_tracks.gpx'

    assert_selector '[aria-label="distance"]', text: '6094'
  end

  private

  def upload_track(file_name)
    sign_in users(:regular_user)
    visit root_path
    click_button I18n.t('application.header.upload_track')

    assert_text I18n.t('static_pages.index.track_form.title')

    find("[aria-label='#{I18n.t('tracks.form.suit_select_placeholder')}']").send_keys :arrow_down
    first('span', exact_text: 'TS Nala').click

    fill_in 'location', with: 'Random Airfield'

    fill_track_file file_name

    click_button I18n.t('static_pages.index.track_form.submit')
  end

  def fill_track_file(file_name)
    file = file_fixture("tracks/#{file_name}")
    find('[type="file"]', visible: false).attach_file file, make_visible: true
  end
end
