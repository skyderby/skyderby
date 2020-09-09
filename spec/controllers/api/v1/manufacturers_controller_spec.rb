describe Api::V1::ManufacturersController do
  render_views

  it '#index' do
    get :index, format: :json

    expect(response).to be_successful
    fields = response.parsed_body['items'].map(&:keys).flatten.uniq

    expect(fields).to match(%w[id name code])
  end

  it '#show' do
    manufacturer = manufacturers(:tony)

    get :show, params: { id: manufacturer.id }, format: :json

    expect(response).to be_successful
    expect(response.parsed_body).to eql(
      'id' => manufacturer.id,
      'name' => manufacturer.name,
      'code' => manufacturer.code
    )
  end

  describe '#create' do
    it 'without permissions' do
      post :create, params: { manufacturer: { name: 'New maker', code: 'NM' } }, format: :json

      expect(response).to be_forbidden
    end

    it 'with permissions' do
      sign_in users(:admin)

      post :create, params: { manufacturer: { name: 'New maker', code: 'NM' } }, format: :json

      expect(response).to be_successful
      expect(response.parsed_body).to match(
        hash_including(
          'name' => 'New maker',
          'code' => 'NM'
        )
      )
    end

    it 'with invalid param' do
      sign_in users(:admin)

      post :create, params: { manufacturer: { code: 'NM' } }, format: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body).to match(
        hash_including('errors' => hash_including('name'))
      )
    end
  end

  describe '#update' do
    it 'without permissions' do
      manufacturer = manufacturers(:tony)

      put :update, params: { id: manufacturer.id, manufacturer: { name: 'New maker' } }, format: :json

      expect(response).to be_forbidden
    end

    it 'with permissions' do
      sign_in users(:admin)

      manufacturer = manufacturers(:tony)

      put :update, params: { id: manufacturer.id, manufacturer: { name: 'New maker' } }, format: :json

      expect(response).to be_successful
      expect(response.parsed_body).to match(
        hash_including(
          'name' => 'New maker',
          'code' => manufacturer.code
        )
      )
    end

    it 'with invalid param' do
      sign_in users(:admin)

      manufacturer = manufacturers(:tony)

      put :update, params: { id: manufacturer.id, manufacturer: { name: '' } }, format: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body).to match(
        hash_including('errors' => hash_including('name'))
      )
    end
  end

  describe '#destroy' do
    it 'without permissions' do
      manufacturer = Manufacturer.create!(name: 'Wrong', code: 'WR')

      delete :destroy, params: { id: manufacturer.id }, format: :json

      expect(response).to be_forbidden
    end

    it 'with permissions' do
      sign_in users(:admin)

      manufacturer = Manufacturer.create!(name: 'Wrong', code: 'WR')

      delete :destroy, params: { id: manufacturer.id }, format: :json

      expect(response).to be_successful
    end

    it 'when have suits' do
      sign_in users(:admin)

      manufacturer = manufacturers(:tony)

      delete :destroy, params: { id: manufacturer.id }, format: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body).to match(
        hash_including(
          'errors' => hash_including(
            'base' => ['Cannot delete record because dependent suits exist']
          )
        )
      )
    end
  end
end
