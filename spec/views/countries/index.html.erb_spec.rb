require 'rails_helper'

RSpec.describe "countries/index", type: :view do
  before(:each) do
    assign(:countries, [
      Country.create!(
        :index => "Index",
        :show => "Show",
        :edit => "Edit"
      ),
      Country.create!(
        :index => "Index",
        :show => "Show",
        :edit => "Edit"
      )
    ])
  end

  it "renders a list of countries" do
    render
    assert_select "tr>td", :text => "Index".to_s, :count => 2
    assert_select "tr>td", :text => "Show".to_s, :count => 2
    assert_select "tr>td", :text => "Edit".to_s, :count => 2
  end
end
