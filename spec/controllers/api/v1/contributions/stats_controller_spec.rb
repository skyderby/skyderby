describe Api::V1::Contributions::StatsController do
  render_views

  let(:profile) { profiles(:regular_user) }

  it 'shows correct stats for admin' do
    profile.contributions.create!(amount: 10, received_at: Time.current)
    profile.contributions.create!(amount: 20, received_at: 2.months.ago)
    profile.contributions.create!(amount: 30, received_at: 4.months.ago)
    profile.contributions.create!(amount: 50, received_at: 2.years.ago)

    sign_in users(:admin)

    get :show, format: :json

    expect(response.parsed_body).to match \
      hash_including(
        'thisMonthAmount' => 10,
        'past90DaysAmount' => 30,
        'pastYearAmount' => 60
      )
  end

  it 'returns 0 when no contributions' do
    sign_in users(:admin)

    get :show, format: :json

    expect(response.parsed_body).to match \
      hash_including(
        'thisMonthAmount' => 0,
        'past90DaysAmount' => 0,
        'pastYearAmount' => 0
      )
  end

  it 'forbidden for non-admin users' do
    get :show, format: :json

    expect(response).to be_forbidden
    expect(response.parsed_body).to eq({ 'errors' => { 'base' => ['forbidden'] } })
  end
end
