describe 'Changing locale', type: :request do
  it 'should handle missing locale gracefully' do
    get root_path(locale: "en'A=0")
    expect(response).to have_http_status(:success)
  end
end
