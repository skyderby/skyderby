require 'rails_helper'

RSpec.describe 'countries/new', type: :view do
  before(:each) do
    assign(:country, Country.new(
                       index: 'MyString',
                       show: 'MyString',
                       edit: 'MyString'
    ))
  end

  it 'renders new country form' do
    render

    assert_select 'form[action=?][method=?]', countries_path, 'post' do
      assert_select 'input#country_index[name=?]', 'country[index]'

      assert_select 'input#country_show[name=?]', 'country[show]'

      assert_select 'input#country_edit[name=?]', 'country[edit]'
    end
  end
end
