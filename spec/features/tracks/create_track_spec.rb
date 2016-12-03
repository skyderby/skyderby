require 'spec_helper'

feature 'Upload tracks', js: true do
  scenario 'Flysight file' do
    visit root_path
    click_link I18n.t('application.header.upload_track')
    sleep 0.5 #wait for modal

    within '#track_upload_form' do
      fill_in 'track[name]', with: 'John'

      click_link I18n.t('tracks.form.toggle_suit_link')
      fill_in 'track[suit]', with: 'Horus'

      fill_in 'track[location]', with: 'Africa'

      fill_track_file 'flysight.csv'

      click_button I18n.t('static_pages.index.track_form.submit')
    end

    click_button I18n.t('general.save')

    expect(page).to have_css('a.btn-tab.active', text: I18n.t('tracks.show.charts'))
  end

  def fill_track_file(file_name)
    file = "#{Rails.root}/spec/support/tracks/#{file_name}"
    page.execute_script("$('#track_file').css({opacity: 100})")
    attach_file 'track[file]', file
  end
end
