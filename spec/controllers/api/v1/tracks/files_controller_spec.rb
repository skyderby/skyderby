describe Api::V1::Tracks::FilesController do
  render_views

  describe '#create' do
    it 'flysight file with one segment' do
      params = {
        'file': fixture_file_upload('files/tracks/distance_2454.csv')
      }

      post :create, params: params, format: :json

      expect(response.successful?).to be_truthy
      expect(response.parsed_body).to match(
        hash_including(
          'fileFormat' => 'flysight',
          'segmentsCount' => 1,
          'id' => kind_of(Numeric)
        )
      )
    end

    it 'garmin file with multiple segments' do
      params = {
        'file': fixture_file_upload('files/tracks/two_tracks.gpx')
      }

      post :create, params: params, format: :json

      expect(response.successful?).to be_truthy
      expect(response.parsed_body).to match(
        hash_including(
          'fileFormat' => 'gpx',
          'segmentsCount' => 3,
          'id' => kind_of(Numeric),
          'segments' => array_including(
            hash_including('name' => kind_of(String), 'hUp' => 561, 'hDown' => 3970, 'pointsCount' => 388),
            hash_including('name' => kind_of(String), 'hUp' => 832, 'hDown' => 4002, 'pointsCount' => 428)
          )
        )
      )
    end

    it 'invalid file' do
      params = {
        'file': fixture_file_upload('files/skyderby_logo.png')
      }

      post :create, params: params, format: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body).to eq(
        'errors' => { 'file' => ['extension must be one of: csv, gpx, tes, kml'] }
      )
    end
  end
end
