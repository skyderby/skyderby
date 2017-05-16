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
    source_profile = create :profile, user_id: 3
    destination = create :profile

    ProfileMerge.new(source: source_profile, destination: destination).execute

    expect(destination.user_id).to eql(3)
  end
end
