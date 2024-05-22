feature 'Suits: index page', type: :system, skip: true do
  scenario 'Access by any user' do
    visit suits_path

    expect(page).to have_css('.suits-index li.active > a', text: 'Overview')
  end
end
