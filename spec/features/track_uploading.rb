require 'spec_helper'

describe 'Uploading tracks', :type => :feature do

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

    expect(page).to have_content ('Александр К. | Трек #')

  end

  it 'GPX file with multiple tracks' do
    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    upload @gpx_two_tracks

    expect(page).to have_content ('Выберите трек для загрузки')

    visit page.find(:xpath, "//table/tbody/tr[1]")['data-url']

    expect(page).to have_content ('Александр К. | Трек #')

  end

  it 'TES file' do

    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    upload @tes_wintec

    expect(page).to have_content ('Александр К. | Трек #')

  end

  it 'CSV FlySight file' do

    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    upload @csv_flysight

    expect(page).to have_content ('Александр К. | Трек #')

  end

  it 'CSV Columbus V900 file' do

    visit root_path
    within '.index-header' do
      click_link 'Загрузить трек'
    end

    upload @csv_columbus

    expect(page).to have_content ('Александр К. | Трек #')

  end

end