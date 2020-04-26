describe Api::V1::SuitsController do
  render_views

  it '#index' do
    get :index, format: :json

    response_json = JSON.parse(response.body)
    fields = response_json['items'].map(&:keys).flatten.uniq

    expect(fields).to match(
      %w[id name make makeCode category]
    )
  end
end
