require 'rails_helper'

RSpec.describe 'countries/edit', type: :view do
  before(:each) do
    @country = assign(:country, Country.create!(
                                  index: 'MyString',
                                  show: 'MyString',
                                  edit: 'MyString'
    ))
  end

  it 'renders the edit country form' do
    render

    assert_select 'form[action=?][method=?]', country_path(@country), 'post' do
      assert_select 'input#country_index[name=?]', 'country[index]'

      assert_select 'input#country_show[name=?]', 'country[show]'

      assert_select 'input#country_edit[name=?]', 'country[edit]'
    end
  end
end
