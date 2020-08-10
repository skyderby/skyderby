describe 'Upload tracks', js: true do
  it 'Flysight file' do
    upload_track 'flysight.csv'

    expect(page).to have_css('[aria-label="distance"]', text: 3496)
  end

  it 'Columbus file' do
    upload_track 'columbus.csv'

    expect(page).to have_css('[aria-label="distance"]', text: 1262)
  end

  it 'Wintec file' do
    upload_track 'wintec.tes'

    expect(page).to have_css('[aria-label="distance"]', text: 4984)
  end

  it 'Dual XGPS160 file' do
    upload_track 'dual_xgps160.kml'

    expect(page).to have_css('[aria-label="distance"]', text: 1203)
  end

  it 'Cybereye file' do
    upload_track 'cyber_eye.csv'

    expect(page).to have_css('[aria-label="distance"]', text: 8487)
  end

  it 'Garmin gpx: one track in file' do
    upload_track 'one_track.gpx'

    expect(page).to have_css('[aria-label="distance"]', text: 3955)
  end

  it 'Garmin gps: multiple tracks in file' do
    upload_track 'two_tracks.gpx'

    expect(page).to have_css('[aria-label="distance"]', text: 6094)
  end

  def upload_track(file_name)
    visit root_path
    click_link I18n.t('application.header.upload_track')

    expect(page).to have_css('.modal-title', text: I18n.t('static_pages.index.track_form.title'))

    sleep 0.1

    within '[data-controller="new-track-form"]' do
      fill_in 'name', with: 'John'

      if page.has_css?('span', text: I18n.t('tracks.form.toggle_suit_link'))
        find('span', text: I18n.t('tracks.form.toggle_suit_link')).click
      end

      fill_in 'missingSuitName', with: 'Horus'

      fill_in 'location', with: 'Africa'

      fill_track_file file_name

      click_button I18n.t('static_pages.index.track_form.submit')
    end
  end

  def fill_track_file(file_name)
    file = file_fixture("tracks/#{file_name}")
    find('[type="file"]', visible: false).attach_file file, make_visible: true
  end
end
