require 'rails_helper'

RSpec.describe "virtual_comp_groups/show", type: :view do
  before(:each) do
    @virtual_comp_group = assign(:virtual_comp_group, VirtualCompGroup.create!(
      :name => "Name"
    ))
  end

  it "renders attributes in <p>" do
    render
    expect(rendered).to match(/Name/)
  end
end
