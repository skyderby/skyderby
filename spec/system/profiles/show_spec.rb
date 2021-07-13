feature 'Show profile', type: :system, skip: true do
  scenario 'Guest user view profile' do
    profile = create :profile
    visit profile_path(profile)

    expect(page).to have_content(profile.name)
  end

  scenario 'Guest user views event profile' do
    event = create :event
    profile = create :profile, owner: event

    visit profile_path(profile)

    expect(page).to have_content(profile.name)
  end
end
