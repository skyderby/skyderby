describe Api::V1::SuitsController do
  render_views

  it '#index' do
    get :index, format: :json

    fields = response.parsed_body.map(&:keys).flatten.uniq

    expect(fields).to match(
      %w[id name make make_code category]
    )
  end
end
