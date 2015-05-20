require 'rails_helper'

RSpec.describe 'badges/new', type: :view do
  before(:each) do
    assign(:badge, Badge.new(
                     name: 'MyString',
                     kind: 'MyString',
                     user_profile: 'MyString'
    ))
  end

  it 'renders new badge form' do
    render

    assert_select 'form[action=?][method=?]', badges_path, 'post' do
      assert_select 'input#badge_name[name=?]', 'badge[name]'

      assert_select 'input#badge_kind[name=?]', 'badge[kind]'

      assert_select 'input#badge_user_profile[name=?]', 'badge[user_profile]'
    end
  end
end
