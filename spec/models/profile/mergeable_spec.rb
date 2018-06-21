describe Profile::Mergeable do
  describe 'merge fields and associations' do
    subject do
      source = Profile.create!(
        name: 'Ivan',
        owner: users(:regular_user),
        country: countries(:norway)
      )

      5.times do
        create :empty_track, pilot: source
        create :badge, profile: source
      end

      destination = Profile.create!(
        name: 'Peter',
        owner: events(:published_public)
      )

      destination.merge_with(source)
      destination
    end

    it 'should not merge name' do
      expect(subject.name).to eq('Peter')
    end

    it 'should merge country' do
      expect(subject.country).to eq(countries(:norway))
    end

    it 'should merge tracks' do
      expect(subject.tracks.count).to eq(5)
    end

    it 'should merge badges' do
      expect(subject.badges.count).to eq(5)
    end
  end

  describe 'userpic' do
    it 'merge userpic from source' do
      source = Profile.create(name: 'Ivan', userpic: fixture_file_upload('files/profile_userpic.png'))
      destination = Profile.create(name: 'Peter')

      destination.merge_with(source)

      expect(destination.userpic_file_name).to eq('profile_userpic.png')
    end

    it 'do not wipe existent userpic' do
      source = Profile.create(name: 'Ivan')
      destination = Profile.create(name: 'Peter', userpic: fixture_file_upload('files/profile_userpic.png'))

      destination.merge_with(source)

      expect(destination.userpic_file_name).to eq('profile_userpic.png')
    end
  end

  describe 'user' do
    it 'merge user if destination user blank' do
      source = Profile.create(name: 'Ivan', owner: users(:regular_user))
      destination = Profile.create(name: 'Peter')

      destination.merge_with(source)

      expect(destination.owner).to eq(users(:regular_user))
    end

    it 'does not merge user if destination user present' do
      source = Profile.create(name: 'Ivan', owner: users(:regular_user))
      destination = Profile.create(name: 'Peter', owner: users(:admin))

      destination.merge_with(source)

      expect(destination.owner).to eq(users(:admin))

    end
  end
end
