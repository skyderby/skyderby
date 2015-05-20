require 'rails_helper'

RSpec.describe 'virtual_comp_groups/index', type: :view do
  before(:each) do
    assign(:virtual_comp_groups, [
      VirtualCompGroup.create!(
        name: 'Name'
      ),
      VirtualCompGroup.create!(
        name: 'Name'
      )
    ])
  end

  it 'renders a list of virtual_comp_groups' do
    render
    assert_select 'tr>td', text: 'Name'.to_s, count: 2
  end
end
