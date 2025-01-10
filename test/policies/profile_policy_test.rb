describe ProfilePolicy do
  describe '#index?' do
    it 'allowed to admins' do
      user = create :user, :admin
      expect(ProfilePolicy.new(user, Profile).index?).to be_truthy
    end

    it 'not allowed to everyone' do
      expect(ProfilePolicy.new(nil, Profile).index?).to be_falsey
    end
  end

  describe '#update?' do
    it 'allowed to admins' do
      profile = create :profile

      user = create :user, :admin
      expect(ProfilePolicy.new(user, profile).update?).to be_truthy
    end

    it 'allowed to owner' do
      user = create :user
      expect(ProfilePolicy.new(user, user.profile).update?).to be_truthy
    end

    it 'allowed to responsible of event' do
      user = create :user
      event = create :event, responsible: user

      profile = create :profile, owner: event
      expect(ProfilePolicy.new(user, profile).update?).to be_truthy
    end

    it 'allowed to organizer of event' do
      user = create :user
      event = create :event
      create :event_organizer, organizable: event, user: user

      profile = create :profile, owner: event
      expect(ProfilePolicy.new(user, profile).update?).to be_truthy
    end

    it 'not allowed to anyone else' do
      profile = create :profile

      user = create :user
      expect(ProfilePolicy.new(user, profile).update?).to be_falsey
    end
  end

  describe '#masquerade?' do
    it 'allowed to admins' do
      user = create :user, :admin
      expect(ProfilePolicy.new(user, Profile).masquerade?).to be_truthy
    end

    it 'not allowed to everyone' do
      expect(ProfilePolicy.new(nil, Profile).masquerade?).to be_falsey
    end
  end

  describe '#merge?' do
    it 'allowed to admins' do
      user = create :user, :admin
      expect(ProfilePolicy.new(user, Profile).merge?).to be_truthy
    end

    it 'not allowed to everyone' do
      expect(ProfilePolicy.new(nil, Profile).merge?).to be_falsey
    end
  end
end
