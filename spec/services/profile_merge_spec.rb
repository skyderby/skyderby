describe ProfileMerge do
  it 'merges tracks from source profile' do
    source_profile = create :profile
    5.times do
      create :empty_track, pilot: source_profile
    end

    destination = create :profile

    ProfileMerge.new(source: source_profile, destination: destination).execute

    expect(destination.tracks.count).to eql(5)
  end

  it 'merges tracks from source profile' do
    source_profile = create :profile
    5.times do
      create :badge, profile: source_profile
    end

    destination = create :profile

    ProfileMerge.new(source: source_profile, destination: destination).execute

    expect(destination.badges.count).to eql(5)
  end

  it 'merges user from source profile if filled' do
    user = create :user
    source_profile = user.profile
    destination = create :profile

    ProfileMerge.new(source: source_profile, destination: destination).execute

    expect(destination.owner).to eql(user)
  end

  it 'does not merge owner if owner is not user' do
    event = create :event
    source_profile = create :profile, owner: event

    user = create :user
    destination = user.profile

    ProfileMerge.new(source: source_profile, destination: destination).execute

    expect(destination.owner).to eql(user)
  end
end
