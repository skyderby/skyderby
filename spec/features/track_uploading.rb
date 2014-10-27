require 'spec_helper'

describe 'Supporting GPS data formats', :type => :feature do

  before do
    @gpx_one_track  = "#{Rails.root}/spec/support/tracks/one_track.gpx"
    @gpx_two_tracks = "#{Rails.root}/spec/support/tracks/two_tracks.gpx"
    @csv_flysight   = "#{Rails.root}/spec/support/tracks/flysight.csv"
    @csv_columbus   = "#{Rails.root}/spec/support/tracks/columbus.csv"
    @tes_wintec     = "#{Rails.root}/spec/support/tracks/wintec.tes"
  end

  it 'GPX file with single track' do
    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    upload @gpx_one_track

    expect(page).to have_xpath('.//div[@id="heights-chart"]')

  end

  it 'GPX file with multiple tracks' do
    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    upload @gpx_two_tracks

    expect(page).to have_content ('Выберите трек для загрузки')

    visit page.find(:xpath, "//table/tbody/tr[1]")['data-url']

    expect(page).to have_xpath('.//div[@id="heights-chart"]')

  end

  it 'TES file' do

    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    upload @tes_wintec

    expect(page).to have_xpath('.//div[@id="heights-chart"]')

  end

  it 'CSV FlySight file' do

    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    upload @csv_flysight

    expect(page).to have_xpath('.//div[@id="heights-chart"]')

  end

  it 'CSV Columbus V900 file' do

    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    upload @csv_columbus

    expect(page).to have_xpath('.//div[@id="heights-chart"]')

  end

end

describe 'Allow unregistered user edit and delete unviewed track', :type => :feature do

  before do
    @track = "#{Rails.root}/spec/support/tracks/flysight.csv"
  end

  it 'Allow edit track' do
    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    upload @track

    expect(page).to have_xpath('.//div[@id="heights-chart"]')

    click_button 'Сохранить'

    expect(page).to have_content('Александр К. | Трек #')

  end

  it 'Allow delete track' do
    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    upload @track

    expect(page).to have_xpath('.//div[@id="heights-chart"]')

    click_link 'Удалить'

    expect(page).to have_content('Загруженные треки:')
  end

  it 'Restrict access to edit again' do
    visit edit_track_path(:id => Track.last.id)
    click_button 'Сохранить'
    expect(page).to have_content('You are not authorized to access this page.')
  end

  it 'Restrict access to delete after show' do
    visit edit_track_path(:id => Track.last.id)
    click_link 'Удалить'
    expect(page).to have_content('You are not authorized to access this page.')
  end

end
