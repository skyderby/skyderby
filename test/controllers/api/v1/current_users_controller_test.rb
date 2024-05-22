describe Api::V1::CurrentUsersController do
  render_views

  let(:default_permissions) { { 'canAccessAdminPanel' => false, 'canCreatePlace' => false, 'canManageUsers' => false } }

  describe '#show' do
    it 'when authorized' do
      sign_in users(:regular_user)

      get :show, format: :json

      expect(response.parsed_body['authorized']).to eq(true)
      expect(response.parsed_body['permissions']).to eq(default_permissions)
    end

    it 'when not authorized' do
      get :show, format: :json

      expect(response.parsed_body['authorized']).to eq(false)
      expect(response.parsed_body['permissions']).to eq(default_permissions)
    end
  end
end
