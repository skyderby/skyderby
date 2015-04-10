require 'rails_helper'

RSpec.describe "countries/show", type: :view do
  before(:each) do
    @country = assign(:country, Country.create!(
      :index => "Index",
      :show => "Show",
      :edit => "Edit"
    ))
  end

  it "renders attributes in <p>" do
    render
    expect(rendered).to match(/Index/)
    expect(rendered).to match(/Show/)
    expect(rendered).to match(/Edit/)
  end
end
