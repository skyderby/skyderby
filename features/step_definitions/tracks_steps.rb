And /^I specify that I wish to upload track$/ do
  click_link 'Загрузить трек'
end

When /^I fill 'Aleksandr K.' in name$/ do
  within '#newTrackModal' do
    fill_in 'name', with: 'Александр К.'
  end
end

And /^I select Ghost 3 in suit text field$/ do
  within '#newTrackModal' do
    click_link 'Enter suit name'
    fill_in 'suit', with: 'Ghost 3'
  end
end

And /^I specify it's skydive track$/ do
  within '#newTrackModal' do
    click_button 'Skydive'
  end
end

And /^I specify location$/ do
  within '#newTrackModal' do
    fill_in 'location', with: 'DZ Borki'
  end
end

And /^I attach a "(.+)" file$/ do |track|
  file = "#{Rails.root}/spec/support/tracks/#{track}"
  script = "$('#track_file').css({opacity: 100})"
  page.execute_script(script)
  within '#newTrackModal' do
    attach_file 'track_file', file
  end
end
 
And /^I click submit$/ do
  within '#newTrackModal' do
    click_button 'Загрузить'
  end
end

Then /^I should see edit track page to specify free fall range$/ do
  expect(page).to have_xpath('.//div[@id="heights-chart"]')
end

Then /^I shoud see choose track page$/ do
  expect(page).to have_content('Выберите трек для загрузки')
end

And /^select segment I want to analyze$/ do
  page.find(:xpath, '//table/tbody/tr[1]').click
end

When /^I fail to attach a track$/ do
  within '#newTrackModal' do
    fill_in 'name', with: 'Александр К.'
    click_link 'Enter suit name'
    fill_in 'suit', with: 'Ghost 3'
    fill_in 'location', with: 'DZ Borki'
    click_button 'Загрузить'
  end
end

When /^I fail to specify name$/ do
  file = "#{Rails.root}/spec/support/tracks/flysight.csv"
  script = "$('#track_file').css({opacity: 100})"
  page.execute_script(script)

  within '#newTrackModal' do
    fill_in 'location', with: 'DZ Borki'
    click_link 'Enter suit name'
    fill_in 'suit', with: 'Ghost 3'
    attach_file 'track_file', file
    click_button 'Загрузить'
  end
end

When /^I fail to specify suit$/ do
  file = "#{Rails.root}/spec/support/tracks/flysight.csv"
  script = "$('#track_file').css({opacity: 100})"
  page.execute_script(script)

  within '#newTrackModal' do
    fill_in 'name', with: 'Александр К.'
    fill_in 'location', with: 'DZ Borki'
    attach_file 'track_file', file
    click_button 'Загрузить'
  end
end

When /^I fail to specify place$/ do
  file = "#{Rails.root}/spec/support/tracks/flysight.csv"
  script = "$('#track_file').css({opacity: 100})"
  page.execute_script(script)

  within '#newTrackModal' do
    fill_in 'name', with: 'Александр К.'
    click_link 'Enter suit name'
    fill_in 'suit', with: 'Ghost 3'
    attach_file 'track_file', file
    click_button 'Загрузить'
  end
end

Then /^I should not be able to submit$/ do
  expect(current_path).to eq root_path
end
