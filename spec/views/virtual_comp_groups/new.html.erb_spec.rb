require 'rails_helper'

RSpec.describe "virtual_comp_groups/new", type: :view do
  before(:each) do
    assign(:virtual_comp_group, VirtualCompGroup.new(
      :name => "MyString"
    ))
  end

  it "renders new virtual_comp_group form" do
    render

    assert_select "form[action=?][method=?]", virtual_comp_groups_path, "post" do

      assert_select "input#virtual_comp_group_name[name=?]", "virtual_comp_group[name]"
    end
  end
end
