require 'rails_helper'

RSpec.describe 'badges/index', type: :view do
  before(:each) do
    assign(:badges, [
      Badge.create!(
        name: 'Name',
        kind: 'Kind',
        user_profile: 'User Profile'
      ),
      Badge.create!(
        name: 'Name',
        kind: 'Kind',
        user_profile: 'User Profile'
      )
    ])
  end

  it 'renders a list of badges' do
    render
    assert_select 'tr>td', text: 'Name'.to_s, count: 2
    assert_select 'tr>td', text: 'Kind'.to_s, count: 2
    assert_select 'tr>td', text: 'User Profile'.to_s, count: 2
  end
end
