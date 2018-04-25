describe TracksController do
  describe 'owner of track' do
    it '#edit' do
      user = create :user
      track = create :empty_track, :with_point, owner: user

      login_as user

      get :edit, params: { id: track.id }

      expect(response.successful?).to be_truthy
    end

    it '#show private track owned by user' do
      user = create :user
      track = create :empty_track, :with_point, owner: user, visibility: Track.visibilities[:private_track]

      login_as user

      get :show, params: { id: track.id }

      expect(response.successful?).to be_truthy
    end
  end

  describe 'track belongs to event' do
    it '#edit by responsible' do
      user = create :user
      event = create :event, responsible: user
      track = create :empty_track, :with_point, owner: event

      login_as user

      get :edit, params: { id: track.id }

      expect(response.successful?).to be_truthy
    end

    it '#edit by organizer' do
      responsible = create :user
      organizer = create :user

      event = create :event, responsible: responsible
      create :event_organizer, organizable: event, user: organizer

      track = create :empty_track, :with_point, owner: event

      login_as organizer

      get :edit, params: { id: track.id }

      expect(response.successful?).to be_truthy
    end
  end

  def login_as(user)
    @request.env['devise.mapping'] = Devise.mappings[:user]
    sign_in user
  end
end
