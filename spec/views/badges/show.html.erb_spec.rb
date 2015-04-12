require 'rails_helper'

RSpec.describe "badges/show", type: :view do
  before(:each) do
    @badge = assign(:badge, Badge.create!(
      :name => "Name",
      :kind => "Kind",
      :user_profile => "User Profile"
    ))
  end

  it "renders attributes in <p>" do
    render
    expect(rendered).to match(/Name/)
    expect(rendered).to match(/Kind/)
    expect(rendered).to match(/User Profile/)
  end
end
