require 'rails_helper'

RSpec.describe 'virtual_comp_groups/edit', type: :view do
  before(:each) do
    @virtual_comp_group = assign(:virtual_comp_group, VirtualCompGroup.create!(
                                                        name: 'MyString'
    ))
  end

  it 'renders the edit virtual_comp_group form' do
    render

    assert_select 'form[action=?][method=?]', virtual_comp_group_path(@virtual_comp_group), 'post' do
      assert_select 'input#virtual_comp_group_name[name=?]', 'virtual_comp_group[name]'
    end
  end
end
