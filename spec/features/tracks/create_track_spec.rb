require 'spec_helper'

feature 'Upload tracks', js: true do
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
    sleep 0.5 # wait for modal

    within '#track_upload_form' do
      fill_in 'track_file[track_attributes][name]', with: 'John'

      click_link I18n.t('tracks.form.toggle_suit_link')
      fill_in 'track_file[track_attributes][suit]', with: 'Horus'

      fill_in 'track_file[track_attributes][location]', with: 'Africa'

      fill_track_file file_name

      click_button I18n.t('static_pages.index.track_form.submit')
    end
  end

  def fill_track_file(file_name)
    file = "#{Rails.root}/spec/support/tracks/#{file_name}"
    page.execute_script("$('#track_file_file').css({opacity: 100})")
    attach_file 'track_file[file]', file
  end
end
