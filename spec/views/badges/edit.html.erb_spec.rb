require 'rails_helper'

RSpec.describe "badges/edit", type: :view do
  before(:each) do
    @badge = assign(:badge, Badge.create!(
      :name => "MyString",
      :kind => "MyString",
      :user_profile => "MyString"
    ))
  end

  it "renders the edit badge form" do
    render

    assert_select "form[action=?][method=?]", badge_path(@badge), "post" do

      assert_select "input#badge_name[name=?]", "badge[name]"

      assert_select "input#badge_kind[name=?]", "badge[kind]"

      assert_select "input#badge_user_profile[name=?]", "badge[user_profile]"
    end
  end
end
