describe Tracks::OwnershipsController do
  describe 'regular user' do
    it 'show is not allowed' do
      get :show, params: { track_id: track.id }

      expect(response.forbidden?).to be_truthy
    end

    it 'update is not allowed' do
      put :update, params: {
        track_id: track.id,
        track_ownership: {
          type: 'None',
          profile_id: '3'
        }
      }, xhr: true

      expect(response.forbidden?).to be_truthy
    end
  end

  describe 'admin user' do
    it 'show is allowed' do
      sign_in admin_user

      get :show, params: { track_id: track.id }

      expect(response.successful?).to be_truthy
    end

    it 'update is allowed' do
      sign_in admin_user

      put :update, params: {
        track_id: track.id,
        track_ownership: {
          type: 'None',
          profile_id: '3'
        }
      }, xhr: true

      expect(response.successful?).to be_truthy
    end
  end

  def admin_user
    @admin_user ||= users(:admin)
  end

  def track
    @track = create_track_from_file 'flysight.csv'
  end
end
