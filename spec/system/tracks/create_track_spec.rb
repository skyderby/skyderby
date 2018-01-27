require 'spec_helper'

feature 'Upload tracks', type: :system, js: true do
  scenario 'Flysight file' do
    upload_track 'flysight.csv'
    click_button I18n.t('general.save')

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  scenario 'Columbus file' do
    upload_track 'columbus.csv'
    click_button I18n.t('general.save')

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  scenario 'Wintec file' do
    upload_track 'wintec.tes'
    click_button I18n.t('general.save')

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  scenario 'Dual XGPS160 file' do
    upload_track 'dual_xgps160.kml'
    click_button I18n.t('general.save')

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  scenario 'CyberEye file' do
    upload_track 'cyber_eye.csv'

    click_button I18n.t('general.save')
    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end
  scenario 'Garmin gpx: one track in file' do
    upload_track 'one_track.gpx'
    click_button I18n.t('general.save')

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  scenario 'Garmin gps: multiple tracks in file' do
    upload_track 'two_tracks.gpx'
    sleep 0.5 # wait for modal
    first('tr.track-segment-row').click

    click_button I18n.t('general.save')

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  def upload_track(file_name)
    visit root_path
    click_link I18n.t('application.header.upload_track')

    within '#track_upload_form' do
      fill_in 'track_file[track_attributes][name]', with: 'John'

      click_link I18n.t('tracks.form.toggle_suit_link')
      fill_in 'track_file[track_attributes][missing_suit_name]', with: 'Horus'

      fill_in 'track_file[track_attributes][location]', with: 'Africa'

      fill_track_file file_name

      click_button I18n.t('static_pages.index.track_form.submit')
    end
  end

  def fill_track_file(file_name)
    file = Rails.root.join('spec', 'support', 'tracks', file_name)
    attach_file 'track_file[file]', file, make_visible: true
  end
end
