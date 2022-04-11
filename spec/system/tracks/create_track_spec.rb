describe 'Upload tracks', js: true do
  it 'Flysight file' do
    upload_track 'flysight.csv'

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  it 'Columbus file' do
    upload_track 'columbus.csv'

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  it 'Wintec file' do
    upload_track 'wintec.tes'

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  it 'Dual XGPS160 file' do
    upload_track 'dual_xgps160.kml'

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  it 'CyberEye file' do
    upload_track 'cyber_eye.csv'

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  it 'Garmin gpx: one track in file' do
    upload_track 'one_track.gpx'

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  it 'Garmin gps: multiple tracks in file' do
    upload_track 'two_tracks.gpx'
    sleep 0.5 # wait for modal
    first('tr.track-segment-row').click

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  def upload_track(file_name)
    visit root_path
    click_link I18n.t('application.header.upload_track')
    sleep 0.3 # wait for modal

    within 'form[data-controller="tracks--form"]' do
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
