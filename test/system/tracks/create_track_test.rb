require 'application_system_test_case'

class CreateTrackTest < ApplicationSystemTestCase
  test 'Flysight file' do
    upload_track 'flysight.csv'

    assert_selector 'a.page-tab-active', text: I18n.t('tracks.show.charts').upcase
  end

  test 'Flysight2 file' do
    upload_track 'fs2-track.csv'

    assert_selector 'a.page-tab-active', text: I18n.t('tracks.show.charts').upcase
  end

  test 'Columbus file' do
    upload_track 'columbus.csv'

    assert_selector 'a.page-tab-active', text: I18n.t('tracks.show.charts').upcase
  end

  test 'Wintec file' do
    upload_track 'wintec.tes'

    assert_selector 'a.page-tab-active', text: I18n.t('tracks.show.charts').upcase
  end

  test 'Dual XGPS160 file' do
    upload_track 'dual_xgps160.kml'

    assert_selector 'a.page-tab-active', text: I18n.t('tracks.show.charts').upcase
  end

  test 'CyberEye file' do
    upload_track 'cyber_eye.csv'

    assert_selector 'a.page-tab-active', text: I18n.t('tracks.show.charts').upcase
  end

  test 'Garmin gpx: one track in file' do
    upload_track 'one_track.gpx'

    assert_selector 'a.page-tab-active', text: I18n.t('tracks.show.charts').upcase
  end

  test 'Garmin gps: multiple tracks in file' do
    upload_track 'two_tracks.gpx'
    assert_selector '.dialog-title', text: I18n.t('tracks.choose.title')

    first('.track-segment-row').click

    assert_selector 'a.page-tab-active', text: I18n.t('tracks.show.charts').upcase
  end

  def upload_track(file_name)
    visit root_path
    click_button I18n.t('application.header.upload_track')
    assert_selector '.dialog-title', text: I18n.t('static_pages.index.track_form.title')

    within 'form' do
      fill_in 'track_file[track_attributes][name]', with: 'John'

      click_link I18n.t('tracks.form.toggle_suit_link')
      fill_in 'track_file[track_attributes][missing_suit_name]', with: 'Horus'

      fill_in 'track_file[track_attributes][location]', with: 'Africa'

      fill_track_file file_name

      click_button I18n.t('static_pages.index.track_form.submit')
    end
  end

  def fill_track_file(file_name)
    file = file_fixture("tracks/#{file_name}")
    attach_file 'track_file[file]', file, make_visible: true
  end
end
