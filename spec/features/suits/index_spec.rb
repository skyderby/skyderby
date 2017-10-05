require 'spec_helper'

feature 'Suits: index page' do
  scenario 'Access by any user' do
    visit suits_path

    expect(page).to have_css('.suits-index li.active > a', text: 'Overview')
  end
end
